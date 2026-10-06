/**
 * Episode 01: Route 53 failover (exam domain 5, Networking and Content Delivery).
 *
 * Text fields accept a tiny inline syntax: `code`, **strong**, *em*.
 *
 * Each step has a final scene `state`, the `flows` that animate while its clip
 * plays (packets along a route, health-check pings), and timed `beats` that
 * move the scene from the previous step's state to this one. With reduced
 * motion the stage jumps straight to `state` and shows the flows as still
 * trails.
 */
const step = (s) => ({ duration: 8, flows: [], beats: [], ...s });

export default {
  id: 'route53-failover',
  number: 1,
  issue: 'OCT 2026',
  domain: 'D5',
  title: 'Route 53 Failover',
  titleLines: ['Route 53', 'Failover'],
  deck: 'When the primary Region goes dark, DNS quietly sends everyone somewhere else. These are the ninety seconds in between.',
  coverLine: 'Health checks, failover records and the TTL tail.',
  // Loaded after the text renders, so three.js never blocks reading.
  loadScene: () => import('./route53-failover.scene.js'),

  ticker: [
    { label: 'Check interval', value: '30 s · fast 10 s' },
    { label: 'Failure threshold', value: '3 in a row' },
    { label: 'Healthy if', value: '> 18% of checkers agree' },
    { label: 'Detection', value: '≈ 30 s × 3' },
    { label: 'Alias → ALB TTL', value: '60 s' },
    { label: 'Route 53 is', value: 'DNS, not a proxy' },
  ],

  steps: [
    step({
      id: 'setup',
      rail: 'One name, two homes',
      kicker: 'The setup',
      title: 'One name, two homes',
      body: [
        'Your app answers at `app.example.com`. The live copy runs behind an Application Load Balancer in **us-east-1**. A warm standby waits behind a second ALB in **us-west-2**. Users never type a Region; they only know the name.',
        'Watch what Route 53 does and doesn’t do. A browser asks it where the name points, then connects straight to the ALB. Route 53 answers questions. It never carries your traffic.',
      ],
      facts: [{ value: 'DNS only', label: 'Route 53 is never in the data path' }],
      caption:
        'Users ask Route 53 where app.example.com lives (lilac), then send their requests straight to the primary ALB in us-east-1 (blue). The standby in us-west-2 idles.',
      state: {
        shot: 'overview',
        primary: 'healthy',
        answer: 'primary',
        failCount: 0,
        alarm: false,
        checkers: false,
        records: false,
        focus: null,
      },
      flows: [
        { route: 'dns', every: 1.6 },
        { route: 'primary', every: 0.45, from: 0.8 },
      ],
    }),

    step({
      id: 'health-check',
      rail: 'Health checks',
      kicker: 'Configure',
      title: 'Someone keeps knocking',
      body: [
        'A Route 53 health check sends requests to the primary endpoint from health checkers in several locations around the world. Every interval, each checker asks the same question: does `/health` answer with a 2xx or 3xx status?',
        'Route 53 counts the endpoint as healthy when **more than 18%** of the checkers say it is. One unlucky checker can’t fail your site on its own.',
      ],
      facts: [
        { value: '30 s', label: 'Standard request interval. The fast option checks every 10 s, at extra cost.' },
        { value: '> 18%', label: 'Share of checkers that must report healthy' },
      ],
      console: {
        title: 'Route 53 · Health checks',
        lines: [
          { path: ['Route 53', 'Health checks', 'Create health check'] },
          { field: 'Name', value: 'app-primary' },
          { field: 'What to monitor', value: 'Endpoint' },
          { field: 'Specify endpoint by', value: 'Domain name' },
          { field: 'Protocol / Port', value: 'HTTPS / 443' },
          { field: 'Domain name', value: 'primary.app.example.com' },
          { field: 'Path', value: '/health' },
          { path: ['Advanced configuration'] },
          { field: 'Request interval', value: 'Standard (30 seconds)' },
          { field: 'Failure threshold', value: '3' },
        ],
      },
      caption:
        'Health checkers (the iridescent orbs) send requests to the primary ALB. Each green return is a passing check.',
      state: {
        shot: 'checkers',
        primary: 'healthy',
        answer: 'primary',
        failCount: 0,
        alarm: false,
        checkers: true,
        records: false,
        focus: 'checkers',
      },
      flows: [
        { route: 'primary', every: 0.7 },
        { pings: 'ok', every: 1.3, from: 0.4 },
      ],
    }),

    step({
      id: 'records',
      rail: 'Failover records',
      kicker: 'Configure',
      title: 'Two records, one name',
      body: [
        'Create two records for `app.example.com` with the **Failover** routing policy. Mark the us-east-1 record **Primary** and attach the health check. Mark the us-west-2 record **Secondary**.',
        'Both records are aliases that point at their Region’s ALB, so there are no IP addresses to manage. While the primary is healthy, Route 53 answers every query with the primary record.',
      ],
      facts: [
        { value: '1 + 1', label: 'One Primary and one Secondary record, same name and type' },
        {
          value: 'Evaluate target health',
          label: 'On an alias record, lets Route 53 also use the ALB’s own target health',
        },
      ],
      console: {
        title: 'Route 53 · Hosted zones',
        lines: [
          { path: ['Route 53', 'Hosted zones', 'example.com', 'Create record'] },
          { field: 'Record name', value: 'app' },
          { field: 'Record type', value: 'A' },
          { field: 'Alias', value: 'On → ALB in us-east-1' },
          { field: 'Routing policy', value: 'Failover' },
          { field: 'Failover record type', value: 'Primary' },
          { field: 'Health check ID', value: 'app-primary' },
          { field: 'Record ID', value: 'app-use1' },
          { path: ['Add another record'] },
          { field: 'Alias', value: 'On → ALB in us-west-2' },
          { field: 'Failover record type', value: 'Secondary' },
          { field: 'Record ID', value: 'app-usw2' },
        ],
      },
      caption:
        'Two failover records hang off one name. The Primary carries the health check, so Route 53 hands it out while it passes.',
      state: {
        shot: 'route53',
        primary: 'healthy',
        answer: 'primary',
        failCount: 0,
        alarm: false,
        checkers: true,
        records: true,
        focus: 'route53',
      },
      flows: [
        { route: 'dns', every: 1.1 },
        { route: 'primary', every: 0.7, from: 0.6 },
        { pings: 'ok', every: 2 },
      ],
    }),

    step({
      id: 'outage',
      rail: 'Three strikes',
      kicker: 'Incident',
      title: 'Three strikes',
      body: [
        'A bad deploy takes down the targets in us-east-1. The ALB has nowhere healthy to send requests, so `/health` starts failing.',
        'Route 53 doesn’t react to a single miss. The endpoint becomes unhealthy only after it fails the **failure threshold** number of consecutive checks: three by default. At the standard interval, that’s about 90 seconds of failures before anything moves.',
      ],
      facts: [
        { value: '3', label: 'Default failure threshold, in consecutive checks (you can set 1–10)' },
        { value: '≈ 90 s', label: '30 s × 3 before the endpoint is marked unhealthy' },
      ],
      console: {
        title: 'CloudWatch · Alarms (us-east-1)',
        lines: [
          { path: ['CloudWatch', 'Alarms', 'Create alarm'] },
          { field: 'Metric', value: 'Route 53 › HealthCheckStatus' },
          { field: 'Health check', value: 'app-primary' },
          { field: 'Statistic / Period', value: 'Minimum / 1 minute' },
          { field: 'Condition', value: 'Lower than 1' },
          { field: 'Notification', value: 'SNS topic ops-pager' },
        ],
        note: 'Route 53 publishes health check metrics in us-east-1, whatever Region the endpoint is in.',
      },
      caption:
        'The servers in us-east-1 fail. Pings come back red, the failure count climbs to three, and the CloudWatch alarm lights up.',
      state: {
        shot: 'primary',
        primary: 'down',
        answer: 'primary',
        failCount: 3,
        alarm: true,
        checkers: true,
        records: true,
        focus: 'primary',
      },
      beats: [
        { at: 0.9, set: { primary: 'down' } },
        { at: 2.1, set: { failCount: 1 } },
        { at: 3.4, set: { failCount: 2 } },
        { at: 4.7, set: { failCount: 3 } },
        { at: 5.0, set: { alarm: true } },
      ],
      flows: [
        { route: 'primary', every: 0.55, to: 0.9 },
        { route: 'primary', every: 0.55, from: 0.9, fate: 'drop' },
        { pings: 'ok', every: 1.3, to: 0.9 },
        { pings: 'fail', every: 1.3, from: 1.0 },
      ],
    }),

    step({
      id: 'failover',
      rail: 'The flip',
      kicker: 'Failover',
      title: 'The answer changes',
      body: [
        'With the primary unhealthy, Route 53 starts answering `app.example.com` with the **Secondary** record. New lookups get the us-west-2 ALB, and new traffic follows.',
        'Nothing moved and nothing restarted; Route 53 just gave a different answer. That only works if the standby can take the load, so keep its capacity and data in step with the primary.',
      ],
      facts: [{ value: '0', label: 'Servers moved. Failover is a different DNS answer, nothing more.' }],
      console: {
        title: 'Route 53 · Health checks',
        lines: [
          { path: ['Route 53', 'Health checks', 'app-primary'] },
          { field: 'Status', value: 'Unhealthy', tone: 'bad' },
          { path: ['Health checkers'] },
          { field: 'Most locations', value: 'Failure: HTTP 503', tone: 'bad' },
        ],
      },
      caption:
        'Route 53 now hands out the Secondary record. New requests land on us-west-2 while us-east-1 stays dark.',
      state: {
        shot: 'overview',
        primary: 'down',
        answer: 'secondary',
        failCount: 3,
        alarm: true,
        checkers: true,
        records: true,
        focus: 'secondary',
      },
      beats: [{ at: 0.7, set: { answer: 'secondary' } }],
      flows: [
        { route: 'dns', every: 1.1 },
        { route: 'secondary', every: 0.45, from: 1.1 },
        { pings: 'fail', every: 2 },
      ],
    }),

    step({
      id: 'ttl',
      rail: 'The TTL tail',
      kicker: 'Side effect',
      title: 'Why some users lag behind',
      body: [
        'Resolvers and clients cache DNS answers for the record’s **TTL**. Anyone who looked up the name just before the flip keeps using the old answer until it expires.',
        'You can’t set a TTL on an alias record: Route 53 uses the target’s, which is **60 seconds** for an ALB. For a non-alias failover record, you choose the TTL, so keep it short (60 seconds or less) and clients come back to ask sooner.',
      ],
      facts: [
        { value: '60 s', label: 'TTL Route 53 uses for an alias that points at an ALB' },
        { value: 'Detect + TTL', label: 'Worst case: time to mark unhealthy, plus one cached TTL' },
      ],
      caption:
        'A few clients with a cached answer still hit us-east-1 and fail (red). As their TTL runs out, they ask again and move to us-west-2.',
      state: {
        shot: 'split',
        primary: 'down',
        answer: 'secondary',
        failCount: 3,
        alarm: true,
        checkers: true,
        records: true,
        focus: null,
      },
      flows: [
        { route: 'secondary', every: 0.45 },
        { route: 'primary', every: 0.9, to: 4.5, fate: 'drop' },
      ],
    }),

    step({
      id: 'failback',
      rail: 'Failback',
      kicker: 'Recovery',
      title: 'Home again, automatically',
      body: [
        'The fix ships and `/health` passes again. Once enough checks pass for Route 53 to call the endpoint healthy, it goes back to answering with the **Primary** record. There’s no button to press.',
        'That’s convenient, and it’s also a risk: a primary that flaps between healthy and unhealthy drags users back and forth. Fix the cause before you trust the green light.',
      ],
      facts: [{ value: 'Automatic', label: 'Route 53 returns to the Primary as soon as it’s healthy again' }],
      console: {
        title: 'Route 53 · Health checks',
        lines: [
          { path: ['Route 53', 'Health checks', 'app-primary'] },
          { field: 'Status', value: 'Healthy', tone: 'ok' },
          { path: ['CloudWatch', 'Alarms', 'app-primary-down'] },
          { field: 'State', value: 'OK', tone: 'ok' },
        ],
      },
      caption:
        'Pings pass again, the alarm clears, and Route 53 sends traffic back to us-east-1. The standby goes back to waiting.',
      state: {
        shot: 'overview',
        primary: 'healthy',
        answer: 'primary',
        failCount: 0,
        alarm: false,
        checkers: true,
        records: true,
        focus: 'primary',
      },
      beats: [
        { at: 0.6, set: { primary: 'healthy' } },
        { at: 2.4, set: { failCount: 0 } },
        { at: 2.6, set: { alarm: false } },
        { at: 3.0, set: { answer: 'primary' } },
      ],
      flows: [
        { pings: 'ok', every: 1.2, from: 0.6 },
        { route: 'dns', every: 1.2 },
        { route: 'secondary', every: 0.45, to: 3.0 },
        { route: 'primary', every: 0.45, from: 3.3 },
      ],
    }),
  ],

  versus: {
    title: 'Not the same as',
    deck: 'Two health checks, two different jobs. The exam loves to swap them.',
    left: {
      kicker: 'Corner A',
      name: 'Route 53 health check',
      rows: [
        ['Decides', 'Which DNS answer Route 53 hands out'],
        ['Checks from', 'Health checkers in locations around the world'],
        ['Watches', 'An endpoint, other health checks, or a CloudWatch alarm'],
        ['When it fails', 'Fails over to another record, often in another Region'],
        ['Private IPs', 'Can’t reach them. Use a CloudWatch alarm-based check.'],
      ],
    },
    right: {
      kicker: 'Corner B',
      name: 'ELB health check',
      rows: [
        ['Decides', 'Which targets get requests'],
        ['Checks from', 'The load balancer, inside your VPC'],
        ['Watches', 'Each registered target in a target group'],
        ['When it fails', 'Routes around that target, in the same Region'],
        ['Private IPs', 'Yes. Targets usually live in private subnets.'],
      ],
    },
    tip: 'If the question says “another Region” or “DNS”, think Route 53. If it says “unhealthy instance behind the load balancer”, think ELB health checks, and an Auto Scaling group that uses the ELB health check type to replace the instance.',
  },

  quiz: [
    {
      id: 'q1',
      question:
        'A company runs its web app in us-east-1 and keeps a standby copy in us-west-2. Users should reach us-west-2 only when us-east-1 is unhealthy. Which Route 53 routing policy fits?',
      options: [
        {
          text: 'Weighted',
          why: 'Weighted routing splits traffic by ratio all the time. It has no idea of primary and standby.',
        },
        {
          text: 'Failover',
          correct: true,
          why: 'Failover returns the Primary record while its health check passes and the Secondary only when it doesn’t.',
        },
        {
          text: 'Latency',
          why: 'Latency routing sends each user to the Region with the lowest latency for them, so both Regions take traffic.',
        },
        { text: 'Geolocation', why: 'Geolocation routes by where the user is, not by whether the Region is healthy.' },
      ],
    },
    {
      id: 'q2',
      question:
        'The primary web servers sit in private subnets with no public IP addresses. How can a Route 53 health check monitor them?',
      options: [
        {
          text: 'Create an endpoint health check that uses the servers’ private IP addresses.',
          why: 'Route 53 health checkers run outside your VPC, so they can’t reach private IP addresses.',
        },
        {
          text: 'Create a CloudWatch alarm on a metric for the servers, then a health check that monitors the alarm.',
          correct: true,
          why: 'A health check can watch a CloudWatch alarm’s state, which works for resources the checkers can’t reach.',
        },
        {
          text: 'Turn on VPC Flow Logs and point the health check at the log group.',
          why: 'Flow Logs record traffic metadata. A health check can’t read a log group.',
        },
        {
          text: 'Use a calculated health check with no child health checks.',
          why: 'A calculated health check combines other health checks. With no children, there’s nothing to evaluate.',
        },
      ],
    },
    {
      id: 'q3',
      question:
        'After a failover, some users keep reaching the failed Region for about a minute, while others move right away. What’s the most likely cause?',
      options: [
        {
          text: 'The health check uses the fast 10-second interval.',
          why: 'A faster interval shortens detection. It doesn’t explain users lagging after the answer has changed.',
        },
        {
          text: 'Resolvers cached the previous DNS answer until its TTL expired.',
          correct: true,
          why: 'Cached answers live until the TTL runs out. Clients that looked up the name just before the flip keep the old one.',
        },
        {
          text: 'The ALB’s deregistration delay is set to 300 seconds.',
          why: 'Deregistration delay lets in-flight requests finish on a target that’s leaving a target group. It doesn’t pin clients to a Region.',
        },
        {
          text: 'Route 53 needs up to 24 hours to propagate a failover.',
          why: 'Failover doesn’t edit any record. Route 53 just starts handing out a different one.',
        },
      ],
    },
  ],

  sources: [
    {
      title: 'Configuring DNS failover',
      href: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html',
    },
    {
      title: 'How Route 53 determines whether a health check is healthy',
      href: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover-determining-health-of-endpoints.html',
    },
    {
      title: 'Failover routing',
      href: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-failover.html',
    },
    {
      title: 'Choosing between alias and non-alias records',
      href: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html',
    },
  ],
};
