/**
 * Exam domains and weights, from the AWS Certified CloudOps Engineer –
 * Associate (SOA-C03) exam guide. Check the current guide before relying on
 * the weights: AWS revises them between exam versions.
 */
export const EXAM = {
  code: 'SOA-C03',
  name: 'AWS Certified CloudOps Engineer – Associate',
};

export const DOMAINS = [
  {
    id: 'D1',
    name: 'Monitoring, Logging, Analysis, Remediation, and Performance Optimization',
    short: 'Monitoring & Remediation',
    weight: 22,
  },
  { id: 'D2', name: 'Reliability and Business Continuity', short: 'Reliability', weight: 22 },
  { id: 'D3', name: 'Deployment, Provisioning, and Automation', short: 'Deployment', weight: 22 },
  { id: 'D4', name: 'Security and Compliance', short: 'Security', weight: 16 },
  { id: 'D5', name: 'Networking and Content Delivery', short: 'Networking', weight: 18 },
];

export const domainById = (id) => DOMAINS.find((d) => d.id === id);
