/**
 * Table of contents. `live` episodes have a module in `loaders`; `planned`
 * ones show on the cover as "in production" cards and don't link anywhere.
 * Edit this list to change what the home page shows.
 */
export const CATALOG = [
  {
    id: 'route53-failover',
    number: 1,
    status: 'live',
    domain: 'D5',
    title: 'Route 53 Failover',
    deck: 'When the primary Region goes dark, DNS quietly sends everyone somewhere else.',
    services: ['Route 53', 'ALB', 'CloudWatch'],
    isNew: true,
  },
  {
    id: 'alarm-to-action',
    number: 2,
    status: 'planned',
    domain: 'D1',
    title: 'Alarm to Action',
    deck: 'CloudWatch alarms that fix things before anyone wakes up.',
    services: ['CloudWatch', 'Systems Manager'],
  },
  {
    id: 'rds-multi-az',
    number: 3,
    status: 'planned',
    domain: 'D2',
    title: 'Multi-AZ, Up Close',
    deck: 'A database standby, a DNS flip, and the minute or two in between.',
    services: ['RDS'],
  },
  {
    id: 'change-sets',
    number: 4,
    status: 'planned',
    domain: 'D3',
    title: 'Stack, Change, Rollback',
    deck: 'Read the change set before CloudFormation reads your mind.',
    services: ['CloudFormation'],
  },
  {
    id: 'policy-evaluation',
    number: 5,
    status: 'planned',
    domain: 'D4',
    title: 'Who Said Yes?',
    deck: 'How IAM decides, one explicit deny at a time.',
    services: ['IAM'],
  },
  {
    id: 'nat-gateway',
    number: 6,
    status: 'planned',
    domain: 'D5',
    title: 'Private Subnet, Public Door',
    deck: 'Outbound only: the NAT gateway and the route table that points at it.',
    services: ['VPC', 'NAT gateway'],
  },
];

export const loaders = {
  'route53-failover': () => import('./route53-failover.js'),
};

export const liveEpisodes = () => CATALOG.filter((e) => e.status === 'live');
