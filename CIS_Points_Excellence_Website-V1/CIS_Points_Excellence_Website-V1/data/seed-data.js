/* ==========================================================================
   CIS Impact Points & Excellence Portal — Initial Offline Seed Data
   Loaded directly via <script src="data/seed-data.js"> (No fetch / No server)
   Imported into IndexedDB ONLY on first-ever initialization.
   ========================================================================== */

(function () {
  var CATALOG_SPEC = [
    {
      catId: 'CAT-01',
      catName: 'Project Delivery Excellence',
      evidence: 'Documented resolution, runbook/SOP link, KPI before/after evidence, or delivery sign-off',
      items: [
        ['Solve a complex technical issue with documented resolution', 10, 'Manager Only'],
        ['Improve an existing delivery process or technical workflow', 10, 'Manager Only'],
        ['Develop a project-specific automation script or utility', 15, 'Manager + Technical'],
        ['Create a new deployment, migration or operations runbook', 15, 'Manager Only'],
        ['Create a detailed technical SOP with validation steps', 15, 'Manager Only'],
        ['Develop a reusable troubleshooting guide or knowledge article', 10, 'Manager Only'],
        ['Create a new reference architecture or validated design pattern', 20, 'Manager + Technical'],
        ['Develop a migration, transformation or modernization playbook', 25, 'Manager + Technical'],
        ['Implement automation that reduces manual effort or errors', 25, 'Manager + Technical'],
        ['Improve reliability, security, performance or resilience', 20, 'Manager + Technical'],
        ['Achieve a measurable reduction in delivery effort or cycle time', 20, 'Manager Only'],
        ['Resolve a critical customer issue with documented business impact', 25, 'Manager Only'],
        ['Lead a complex technical recovery or transformation milestone', 30, 'Manager + Technical'],
        ['Develop a delivery quality improvement adopted by the project', 15, 'Manager Only'],
        ['Improve a project KPI with verified before-and-after evidence', 20, 'Manager Only']
      ]
    },
    {
      catId: 'CAT-02',
      catName: 'Innovation & Accelerator Creation',
      evidence: 'PoC/prototype repository, accelerator documentation, security review, or IP filing record',
      items: [
        ['Submit a new, actionable innovation idea', 5, 'Manager Only'],
        ['Develop a proof of concept (PoC)', 15, 'Manager + Technical'],
        ['Build a functional prototype', 25, 'Manager + Technical'],
        ['Develop a reusable technical component or utility', 25, 'Manager + Technical'],
        ['Create a new automation accelerator', 30, 'Manager + Technical'],
        ['Develop an AI/GenAI/agentic AI use case with working prototype', 30, 'Manager + Technical'],
        ['Develop a new CIS solution or service offering concept', 25, 'Manager + Technical'],
        ['Create a cloud, infrastructure or operations reference architecture', 25, 'Manager + Technical'],
        ['Build an accelerator with documentation and deployment instructions', 35, 'Manager + Technical + Leadership'],
        ['Integrate an accelerator with an existing platform or toolchain', 30, 'Manager + Technical'],
        ['Complete technical validation and security review', 15, 'Manager + Technical'],
        ['Package an accelerator for controlled enterprise use', 25, 'Manager + Technical'],
        ['Obtain approval for an accelerator to enter the practice catalogue', 20, 'Manager + Technical'],
        ['Develop a differentiating solution for a strategic customer problem', 30, 'Manager + Technical + Leadership'],
        ['File an invention disclosure or initiate formal IP assessment', 25, 'Manager + Technical + Leadership'],
        ['Obtain approval for a patent or other formal IP milestone', 50, 'Manager + Technical + Leadership']
      ]
    },
    {
      catId: 'CAT-03',
      catName: 'Industrialization & Reuse',
      evidence: 'Practice repository URL, version tag, validation sign-off, and distinct project reuse log',
      items: [
        ['Convert a project-specific asset into a standard template', 15, 'Manager + Technical'],
        ['Standardize a project SOP into a practice SOP', 20, 'Manager + Technical'],
        ['Create a reusable implementation checklist or quality gate', 15, 'Manager + Technical'],
        ['Create a standardized assessment or discovery framework', 20, 'Manager + Technical'],
        ['Create a reusable Terraform, Ansible or IaC module', 25, 'Manager + Technical'],
        ['Create a repeatable migration factory component', 25, 'Manager + Technical'],
        ['Develop a standard operating model or service blueprint', 25, 'Manager + Technical'],
        ['Create a reference implementation with test cases', 20, 'Manager + Technical'],
        ['Add version control, ownership, release and maintenance processes', 20, 'Manager + Technical'],
        ['Complete security, quality and architecture validation', 20, 'Manager + Technical'],
        ['Publish the asset in the approved practice repository', 10, 'Manager + Technical'],
        ['Obtain formal designation as a CIS best practice', 20, 'Manager + Technical'],
        ['Achieve first verified reuse by another project', 15, 'Manager + Technical'],
        ['Achieve reuse by three distinct projects', 25, 'Manager + Technical + Leadership'],
        ['Achieve reuse by five or more distinct projects', 40, 'Manager + Technical + Leadership'],
        ['Demonstrate verified cost, effort or quality benefits across projects', 25, 'Manager + Technical'],
        ['Establish an asset lifecycle, support model and improvement process', 20, 'Manager + Technical']
      ]
    },
    {
      catId: 'CAT-04',
      catName: 'Thought Leadership & Technical Content',
      evidence: 'Published article/whitepaper URL, event agenda, slide deck, or proposal library link',
      items: [
        ['Publish an internal technical knowledge article', 5, 'Manager Only'],
        ['Create a technical blog or engineering insight', 10, 'Manager Only'],
        ['Develop a detailed technical whitepaper', 25, 'Manager + Technical'],
        ['Develop a customer-focused point of view (PoV)', 20, 'Manager + Technical'],
        ['Create an industry trends or technology landscape paper', 20, 'Manager + Technical'],
        ['Develop a solution positioning paper for a CIS offering', 20, 'Manager + Technical'],
        ['Create a technical comparison or vendor evaluation framework', 15, 'Manager + Technical'],
        ['Develop a business case or value realization framework', 20, 'Manager Only'],
        ['Develop a technical reference architecture paper', 20, 'Manager + Technical'],
        ['Contribute to a published industry paper or external technical forum', 25, 'Manager + Technical + Leadership'],
        ['Present at a customer or industry technical forum', 20, 'Manager + Technical'],
        ['Present an approved solution at a major industry event', 30, 'Manager + Technical + Leadership'],
        ['Create reusable presales technical content', 15, 'Manager Only'],
        ['Develop a technical proposal response library or solution blueprint', 20, 'Manager + Technical'],
        ['Produce an executive-level technology strategy paper', 25, 'Manager + Technical + Leadership']
      ]
    },
    {
      catId: 'CAT-05',
      catName: 'Practice Development & Solutions',
      evidence: 'Service offering doc, RFP/pursuit record, demo link, customer win confirmation, or CoE charter',
      items: [
        ['Support a practice initiative outside normal assigned work', 10, 'Manager Only'],
        ['Develop or improve a CIS service offering', 20, 'Manager + Technical'],
        ['Create a service catalogue entry with scope and value proposition', 15, 'Manager Only'],
        ['Develop a solution blueprint for a strategic opportunity', 20, 'Manager + Technical'],
        ['Create a reusable proposal or RFP response module', 15, 'Manager Only'],
        ['Support a qualified presales opportunity with technical inputs', 10, 'Manager Only'],
        ['Develop a differentiated solution for a strategic deal', 20, 'Manager + Technical'],
        ['Complete a major solution architecture or design review', 15, 'Manager + Technical'],
        ['Develop a customer presentation or solution demonstration', 15, 'Manager Only'],
        ['Build a reusable demo environment', 25, 'Manager + Technical'],
        ['Develop a pricing, estimation or sizing model', 20, 'Manager Only'],
        ['Contribute to a strategic pursuit with documented solution impact', 20, 'Manager + Technical'],
        ['Contribute to a verified customer win with demonstrable ownership', 40, 'Manager + Technical + Leadership'],
        ['Support a practice certification or specialization milestone', 25, 'Manager + Technical'],
        ['Establish a technical CoE, community of practice or competency framework', 25, 'Manager + Technical'],
        ['Help develop a strategic technology partnership or joint solution', 25, 'Manager + Technical']
      ]
    },
    {
      catId: 'CAT-06',
      catName: 'Cross-Project & Critical Support',
      evidence: 'Peer review notes, support ticket/RCA, cross-project stakeholder confirmation, or KT record',
      items: [
        ['Provide a technical consultation to another project', 5, 'Manager Only'],
        ['Conduct a structured peer review for another project', 10, 'Manager Only'],
        ['Support a complex migration or architecture design', 15, 'Manager + Technical'],
        ['Help another team resolve a critical technical blocker', 15, 'Manager Only'],
        ['Develop a reusable fix for an issue affecting multiple projects', 20, 'Manager + Technical'],
        ['Provide emergency support that prevents material delivery disruption', 20, 'Manager Only'],
        ['Lead a cross-project technical recovery', 25, 'Manager + Technical'],
        ['Provide specialist support for a strategic or at-risk project', 20, 'Manager Only'],
        ['Transfer knowledge that enables another team to operate independently', 15, 'Manager Only'],
        ['Support a cross-practice solution or delivery initiative', 20, 'Manager Only'],
        ['Provide verified support resulting in improved delivery outcomes', 20, 'Manager Only'],
        ['Establish a recurring cross-project technical support mechanism', 20, 'Manager Only']
      ]
    },
    {
      catId: 'CAT-07',
      catName: 'Training, Mentoring & Capability',
      evidence: 'Training deck, lab repository, attendance log, mentoring plan, or certification metrics',
      items: [
        ['Develop structured training material', 10, 'Manager Only'],
        ['Deliver an internal technical knowledge-sharing session', 5, 'Manager Only'],
        ['Deliver a hands-on workshop or lab', 10, 'Manager Only'],
        ['Develop a reusable technical lab or learning environment', 20, 'Manager + Technical'],
        ['Create a role-based learning path', 15, 'Manager Only'],
        ['Mentor an engineer through a structured development plan', 10, 'Manager Only'],
        ['Conduct technical interview or assessment panels', 5, 'Manager Only'],
        ['Develop certification preparation material', 10, 'Manager Only'],
        ['Lead a bootcamp or technical enablement program', 20, 'Manager Only'],
        ['Create an internal certification or competency assessment framework', 20, 'Manager + Technical'],
        ['Enable another team to independently use an accelerator', 15, 'Manager + Technical'],
        ['Deliver a train-the-trainer program', 15, 'Manager Only'],
        ['Develop a community of practice', 20, 'Manager Only'],
        ['Contribute to a verified increase in team certification or competency', 20, 'Manager Only']
      ]
    },
    {
      catId: 'CAT-08',
      catName: 'Quality, Security & Operational Excellence',
      evidence: 'Security/compliance audit report, SRE/observability metrics, RCA fix, or quality gate record',
      items: [
        ['Identify a material technical risk and provide validated mitigation', 10, 'Manager + Technical'],
        ['Improve a security or compliance control', 15, 'Manager + Technical'],
        ['Develop a reusable security baseline or compliance checklist', 20, 'Manager + Technical'],
        ['Improve monitoring, observability or incident prevention', 20, 'Manager + Technical'],
        ['Create a resilience, backup or disaster recovery validation framework', 20, 'Manager + Technical'],
        ['Develop an SRE, reliability or service quality improvement', 20, 'Manager + Technical'],
        ['Establish a repeatable root-cause analysis process', 15, 'Manager Only'],
        ['Eliminate a recurring incident through a permanent fix', 25, 'Manager + Technical'],
        ['Improve operational KPIs with verified evidence', 20, 'Manager Only'],
        ['Introduce a quality gate that prevents recurring defects', 20, 'Manager + Technical'],
        ['Reduce operational toil through automation', 25, 'Manager + Technical'],
        ['Create a measurable sustainability or energy-efficiency improvement', 20, 'Manager + Technical']
      ]
    },
    {
      catId: 'CAT-09',
      catName: 'Leadership, Collaboration & Culture',
      evidence: 'Initiative charter, event summary, onboarding/mentoring log, or leadership endorsement',
      items: [
        ['Volunteer for an approved practice initiative', 5, 'Manager Only'],
        ['Coordinate a cross-team technical initiative', 15, 'Manager Only'],
        ['Lead a community technical event', 10, 'Manager Only'],
        ['Actively contribute to a technical community', 5, 'Manager Only'],
        ['Recognize and enable contributors through documented mentoring', 10, 'Manager Only'],
        ['Help onboard a new team or capability', 15, 'Manager Only'],
        ['Establish a repeatable knowledge-sharing mechanism', 15, 'Manager Only'],
        ['Resolve a cross-team dependency that materially improves delivery', 15, 'Manager Only'],
        ['Lead an approved continuous improvement initiative', 20, 'Manager Only'],
        ['Demonstrate exceptional collaboration during a critical engagement', 15, 'Manager Only']
      ]
    }
  ];

  function resolveReviewTrack(catId, name, approvalReq, pts) {
    var lower = String(name || '').toLowerCase();
    var isCouncilAsset =
      catId === 'CAT-02' ||
      catId === 'CAT-03' ||
      catId === 'CAT-08' ||
      approvalReq === 'Manager + Technical' ||
      approvalReq === 'Manager + Technical + Leadership' ||
      pts >= 25 ||
      /accelerator|reusable|security|compliance|whitepaper|industry paper|major industry event|patent|ip|framework|architecture/.test(lower);
    return isCouncilAsset
      ? 'Technical Review / CIS Contribution Council'
      : 'Manager / Asset-Owner Validation';
  }

  function buildInitialPointsMaster() {
    var list = [];
    for (var cIdx = 0; cIdx < CATALOG_SPEC.length; cIdx++) {
      var cat = CATALOG_SPEC[cIdx];
      for (var aIdx = 0; aIdx < cat.items.length; aIdx++) {
        var item = cat.items[aIdx];
        var cNum = String(cIdx + 1).padStart(2, '0');
        var aNum = String(aIdx + 1).padStart(2, '0');
        list.push({
          id: 'ACT-' + cNum + '-' + aNum,
          categoryId: cat.catId,
          categoryName: cat.catName,
          name: item[0],
          description: 'CIS Framework activity under ' + cat.catName + ': ' + item[0] + '.',
          defaultPoints: item[1],
          evidenceRequirements: cat.evidence,
          approvalRequirement: item[2],
          reviewTrack: resolveReviewTrack(cat.catId, item[0], item[2], item[1]),
          active: true
        });
      }
    }
    return list;
  }

  window.CIS_CATALOG_VERSION = 'cis-official-9cat-v2';
  window.buildOfficialCISPointsMaster = buildInitialPointsMaster;

  window.buildCISSeedData = function () {
    var points_master = buildInitialPointsMaster();

    var teams = [
      { id: 'TM-01', name: 'Cloud Platform Ops', department: 'Cloud Engineering', managerId: 'EMP-002' },
      { id: 'TM-02', name: 'Site Reliability', department: 'Cloud Engineering', managerId: 'EMP-003' },
      { id: 'TM-03', name: 'Cyber Defense & IAM', department: 'Security & Risk', managerId: 'EMP-004' },
      { id: 'TM-04', name: 'AI & Automation Lab', department: 'Data & AI', managerId: 'EMP-005' },
      { id: 'TM-05', name: 'Enterprise Delivery', department: 'Enterprise Delivery', managerId: 'EMP-006' }
    ];

    var projects = [
      { id: 'PRJ-01', name: 'Project Horizon Cloud Migration', department: 'Cloud Engineering', teamId: 'TM-01', status: 'Active' },
      { id: 'PRJ-02', name: 'Zero-Downtime Core SRE', department: 'Cloud Engineering', teamId: 'TM-02', status: 'Active' },
      { id: 'PRJ-03', name: 'Zero-Trust IAM Modernization', department: 'Security & Risk', teamId: 'TM-03', status: 'Active' },
      { id: 'PRJ-04', name: 'AIOps Self-Healing Platform', department: 'Data & AI', teamId: 'TM-04', status: 'Active' },
      { id: 'PRJ-05', name: 'Global FinServ Delivery', department: 'Enterprise Delivery', teamId: 'TM-05', status: 'Active' }
    ];

    var badges = [
      { id: 'BDG-01', name: 'Bronze Contributor', minPoints: 25, indicativeReward: 'Certificate / Non-Cash Recognition', color: '#9E7749', bg: '#F5EBD7', description: 'Foundational CIS impact contributor (Proposed Year 1 threshold)', order: 1 },
      { id: 'BDG-02', name: 'Silver Achiever', minPoints: 75, indicativeReward: '₹1,000–₹2,000 (Indicative)', color: '#6E7F8A', bg: '#DFEAF3', description: 'Consistent value creator across projects', order: 2 },
      { id: 'BDG-03', name: 'Gold Excellence', minPoints: 150, indicativeReward: '₹3,000–₹5,000 (Indicative)', color: '#A88438', bg: '#F5EBD7', description: 'High-impact technical & delivery leader', order: 3 },
      { id: 'BDG-04', name: 'Platinum Champion', minPoints: 300, indicativeReward: '₹7,500–₹10,000 (Indicative)', color: '#5882A3', bg: '#DFEAF3', description: 'Sustained multi-quarter organizational excellence', order: 4 },
      { id: 'BDG-05', name: 'Diamond Innovator', minPoints: 500, indicativeReward: '₹15,000–₹25,000 (Indicative)', color: '#7A6899', bg: '#EDE5F2', description: 'Transformational enterprise contributor', order: 5 },
      { id: 'BDG-06', name: 'Master of Excellence', minPoints: 750, indicativeReward: '₹40,000–₹60,000 (Indicative)', color: '#558472', bg: '#E5F2ED', description: 'Practice-wide authority, mentor, and accelerator builder', order: 6 },
      { id: 'BDG-07', name: 'CIS Legend', minPoints: 1000, indicativeReward: '₹1,00,000–₹1,50,000 (Indicative)', color: '#8C6258', bg: '#F4E4E1', description: 'Pinnacle lifetime excellence across CIS', order: 7 }
    ];

    var specialist_badges = [
      { id: 'SB-01', name: 'Innovation Catalyst', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes breakthrough ideation, novel PoCs, and transformative solutions.', criteria: 'Minimum 2 approved Innovation & Accelerator contributions with verified impact.', active: true },
      { id: 'SB-02', name: 'Accelerator Architect', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes end-to-end creation of documented, package-ready reusable accelerators.', criteria: 'Built and technically validated at least 1 package-ready accelerator.', active: true },
      { id: 'SB-03', name: 'Industrialization Champion', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes SOPs, playbooks, blueprints, and engineering standardization.', criteria: 'Published standardized frameworks adopted across multiple delivery teams.', active: true },
      { id: 'SB-04', name: 'Reuse Champion', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes verified adoption and cross-project reuse of CIS assets.', criteria: 'Documented reuse by 3+ distinct projects with measured engineering savings.', active: true },
      { id: 'SB-05', name: 'Thought Leader', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes accepted publications, whitepapers, blogs, and conference talks.', criteria: 'Published 2+ peer-reviewed technical papers or external speaking sessions.', active: true },
      { id: 'SB-06', name: 'Practice Builder', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes CoE growth, solution offerings, and practice capability assets.', criteria: 'Contributed core practice offering or CoE framework.', active: true },
      { id: 'SB-07', name: 'Customer Win Enabler', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes presales excellence, RFP architecture, and verified customer wins.', criteria: 'Supported presales proposals resulting in verified customer wins.', active: true },
      { id: 'SB-08', name: 'Delivery Excellence Champion', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes extraordinary SLA outcomes, defect reduction, and client commendation.', criteria: 'Verified client appreciation and measurable delivery milestone lift.', active: true },
      { id: 'SB-09', name: 'Cross-Project Hero', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes critical troubleshooting and support beyond home project.', criteria: 'Resolved 2+ escalated cross-project technical or delivery blockers.', active: true },
      { id: 'SB-10', name: 'Capability Builder', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes mentoring, internal training, and team upskilling.', criteria: 'Mentored engineers or delivered 3+ structured technical training sessions.', active: true },
      { id: 'SB-11', name: 'Automation Champion', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes high-ROI automation eliminating repetitive operational effort.', criteria: 'Delivered verified automation saving 100+ engineering hours annually.', active: true },
      { id: 'SB-12', name: 'Quality & Resilience Champion', awardType: 'Nominated / Reviewer-Awarded', description: 'Recognizes proactive security, compliance, and reliability engineering.', criteria: 'Prevented critical incidents or delivered reusable resilience controls.', active: true }
    ];

    var employees = [
      { id: 'EMP-001', name: 'Priya Nair', email: 'priya.nair@techm-cis.local', department: 'Enterprise Delivery', teamId: 'TM-05', teamName: 'Enterprise Delivery', projectId: 'PRJ-05', projectName: 'Global FinServ Delivery', managerId: null, designation: 'Program Director', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-002', name: 'Marcus Vance', email: 'marcus.vance@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration', managerId: 'EMP-009', designation: 'Engineering Manager', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-003', name: 'Elena Rostova', email: 'elena.rostova@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-02', teamName: 'Site Reliability', projectId: 'PRJ-02', projectName: 'Zero-Downtime Core SRE', managerId: 'EMP-009', designation: 'SRE Lead', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-004', name: 'David Kim', email: 'david.kim@techm-cis.local', department: 'Security & Risk', teamId: 'TM-03', teamName: 'Cyber Defense & IAM', projectId: 'PRJ-03', projectName: 'Zero-Trust IAM Modernization', managerId: 'EMP-010', designation: 'Security Lead', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-005', name: 'Ananya Sharma', email: 'ananya.sharma@techm-cis.local', department: 'Data & AI', teamId: 'TM-04', teamName: 'AI & Automation Lab', projectId: 'PRJ-04', projectName: 'AIOps Self-Healing Platform', managerId: 'EMP-010', designation: 'AI Practice Manager', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-006', name: 'Robert Chen', email: 'robert.chen@techm-cis.local', department: 'Enterprise Delivery', teamId: 'TM-05', teamName: 'Enterprise Delivery', projectId: 'PRJ-05', projectName: 'Global FinServ Delivery', managerId: 'EMP-009', designation: 'Delivery Manager', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-007', name: 'Vikram Patel', email: 'vikram.patel@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration', managerId: 'EMP-002', designation: 'Principal Architect', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Accelerator Architect'] },
      { id: 'EMP-008', name: 'Sophia Lindqvist', email: 'sophia.lindqvist@techm-cis.local', department: 'Security & Risk', teamId: 'TM-03', teamName: 'Cyber Defense & IAM', projectId: 'PRJ-03', projectName: 'Zero-Trust IAM Modernization', managerId: 'EMP-004', designation: 'Security Architect', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Quality & Resilience Champion'] },
      { id: 'EMP-009', name: 'Catherine Brooks', email: 'catherine.brooks@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration', managerId: null, designation: 'Practice Head', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Practice Builder'] },
      { id: 'EMP-010', name: 'Rajesh Iyer', email: 'rajesh.iyer@techm-cis.local', department: 'Data & AI', teamId: 'TM-04', teamName: 'AI & Automation Lab', projectId: 'PRJ-04', projectName: 'AIOps Self-Healing Platform', managerId: null, designation: 'Practice Head', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Innovation Catalyst'] },
      { id: 'EMP-011', name: 'Aarav Mehta', email: 'aarav.mehta@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration', managerId: 'EMP-002', designation: 'Senior Cloud Engineer', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Automation Champion'] },
      { id: 'EMP-012', name: 'Maya Lin', email: 'maya.lin@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-02', teamName: 'Site Reliability', projectId: 'PRJ-02', projectName: 'Zero-Downtime Core SRE', managerId: 'EMP-003', designation: 'Site Reliability Engineer', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-013', name: 'Liam OConnor', email: 'liam.oconnor@techm-cis.local', department: 'Security & Risk', teamId: 'TM-03', teamName: 'Cyber Defense & IAM', projectId: 'PRJ-03', projectName: 'Zero-Trust IAM Modernization', managerId: 'EMP-004', designation: 'IAM Specialist', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-014', name: 'Neha Deshmukh', email: 'neha.deshmukh@techm-cis.local', department: 'Data & AI', teamId: 'TM-04', teamName: 'AI & Automation Lab', projectId: 'PRJ-04', projectName: 'AIOps Self-Healing Platform', managerId: 'EMP-005', designation: 'ML Automation Engineer', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Innovation Catalyst'] },
      { id: 'EMP-015', name: 'Carlos Rivera', email: 'carlos.rivera@techm-cis.local', department: 'Enterprise Delivery', teamId: 'TM-05', teamName: 'Enterprise Delivery', projectId: 'PRJ-05', projectName: 'Global FinServ Delivery', managerId: 'EMP-006', designation: 'Senior Delivery Consultant', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: ['Customer Win Enabler'] },
      { id: 'EMP-016', name: 'Hannah Abbott', email: 'hannah.abbott@techm-cis.local', department: 'Cloud Engineering', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration', managerId: 'EMP-002', designation: 'Cloud Platform Engineer', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-017', name: 'Karan Malhotra', email: 'karan.malhotra@techm-cis.local', department: 'Data & AI', teamId: 'TM-04', teamName: 'AI & Automation Lab', projectId: 'PRJ-04', projectName: 'AIOps Self-Healing Platform', managerId: 'EMP-005', designation: 'Data & Automation Analyst', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] },
      { id: 'EMP-018', name: 'Zoe Gallagher', email: 'zoe.gallagher@techm-cis.local', department: 'Security & Risk', teamId: 'TM-03', teamName: 'Cyber Defense & IAM', projectId: 'PRJ-03', projectName: 'Zero-Trust IAM Modernization', managerId: 'EMP-004', designation: 'Cloud Security Engineer', active: true, lifetimePoints: 0, annualPoints: 0, currentBadge: 'None', badgeHistory: [], specialistBadges: [] }
    ];

    var sampleSpecs = [
      { empIdx: 10, actIdx: 3, title: 'Terraform Multi-Region Automation Framework', date: '2025-05-14', status: 'Approved', mult: 1.5, timeSaved: 320, costSaved: 42000 },
      { empIdx: 10, actIdx: 24, title: 'Core Cluster Architecture Modernization', date: '2025-09-20', status: 'Approved', mult: 2.0, timeSaved: 210, costSaved: 55000 },
      { empIdx: 11, actIdx: 18, title: 'Multi-AZ Active-Active Failover Rollout', date: '2025-06-11', status: 'Approved', mult: 1.5, timeSaved: 180, costSaved: 38000 },
      { empIdx: 12, actIdx: 33, title: 'Automated CVE Patch Orchestrator', date: '2025-08-05', status: 'Approved', mult: 1.5, timeSaved: 240, costSaved: 48000 },
      { empIdx: 13, actIdx: 2, title: 'Predictive Incident Triage ML Pipeline', date: '2025-10-12', status: 'Approved', mult: 2.0, timeSaved: 410, costSaved: 72000 },
      { empIdx: 14, actIdx: 51, title: 'FinServ Core Cutover Zero-Defect Delivery', date: '2025-11-04', status: 'Approved', mult: 1.5, timeSaved: 150, costSaved: 35000 },
      { empIdx: 6, actIdx: 10, title: 'Enterprise CI/CD Pipeline Standardization', date: '2025-07-19', status: 'Approved', mult: 1.5, timeSaved: 290, costSaved: 41000 },
      { empIdx: 7, actIdx: 40, title: 'Cloud Security Posture Guardrails Pack', date: '2025-08-22', status: 'Approved', mult: 2.0, timeSaved: 190, costSaved: 62000 },
      { empIdx: 10, actIdx: 8, title: 'Self-Healing Kubernetes Pod Recovery Engine', date: '2026-01-18', status: 'Approved', mult: 2.0, timeSaved: 280, costSaved: 64000 },
      { empIdx: 10, actIdx: 98, title: 'Reusable Cloud Landing Zone Blueprint', date: '2026-02-24', status: 'Approved', mult: 1.5, timeSaved: 220, costSaved: 39000, teamSplit: [{ empIdx: 10, pct: 60 }, { empIdx: 15, pct: 40 }] },
      { empIdx: 10, actIdx: 56, title: 'Kubernetes FinOps Enablement Workshop', date: '2026-04-10', status: 'Approved', mult: 1.0, timeSaved: 45, costSaved: 8000 },
      { empIdx: 11, actIdx: 15, title: 'P1 Payment Gateway Latency Root-Cause Fix', date: '2026-01-29', status: 'Approved', mult: 1.5, timeSaved: 140, costSaved: 45000 },
      { empIdx: 11, actIdx: 21, title: 'Canary Deployment Rollback Automation', date: '2026-03-14', status: 'Approved', mult: 1.2, timeSaved: 110, costSaved: 22000 },
      { empIdx: 12, actIdx: 30, title: 'Zero-Trust Privileged Access Automation', date: '2026-02-08', status: 'Approved', mult: 1.5, timeSaved: 160, costSaved: 34000 },
      { empIdx: 12, actIdx: 39, title: 'SOC2 Type II Automated Evidence Collector', date: '2026-05-03', status: 'Approved', mult: 1.2, timeSaved: 130, costSaved: 26000 },
      { empIdx: 13, actIdx: 3, title: 'AIOps Anomaly Detection Reusable SDK', date: '2026-02-19', status: 'Approved', mult: 1.5, timeSaved: 340, costSaved: 58000, teamSplit: [{ empIdx: 13, pct: 70 }, { empIdx: 16, pct: 30 }] },
      { empIdx: 13, actIdx: 116, title: 'LLM Log Summarizer Applied to SRE Runbooks', date: '2026-06-11', status: 'Approved', mult: 1.5, timeSaved: 200, costSaved: 31000 },
      { empIdx: 14, actIdx: 44, title: 'Executive SLA Dashboard & Escalation Reduction', date: '2026-03-22', status: 'Approved', mult: 1.2, timeSaved: 95, costSaved: 19000 },
      { empIdx: 14, actIdx: 84, title: 'Cloud License Rationalization Savings', date: '2026-07-07', status: 'Approved', mult: 1.5, timeSaved: 80, costSaved: 85000 },
      { empIdx: 15, actIdx: 113, title: 'AWS Solutions Architect Professional Certification', date: '2026-04-02', status: 'Approved', mult: 1.0, timeSaved: 20, costSaved: 5000 },
      { empIdx: 16, actIdx: 1, title: 'Automated Data Quality Drift Scripts', date: '2026-05-19', status: 'Approved', mult: 1.2, timeSaved: 120, costSaved: 21000 },
      { empIdx: 17, actIdx: 29, title: 'Critical IAM Role Escalation Remediation', date: '2026-06-25', status: 'Approved', mult: 1.5, timeSaved: 90, costSaved: 40000 },
      { empIdx: 1, actIdx: 79, title: 'Cloud Engineering Cross-Team Delivery Playbook', date: '2026-03-08', status: 'Approved', mult: 1.2, timeSaved: 110, costSaved: 24000 },
      { empIdx: 6, actIdx: 102, title: 'Enterprise Reference Architecture v3', date: '2026-05-15', status: 'Approved', mult: 1.5, timeSaved: 175, costSaved: 36000 },
      { empIdx: 10, actIdx: 7, title: 'Intelligent Synthetic Probe Monitoring', date: '2026-10-12', status: 'Pending', mult: 1.5, timeSaved: 140, costSaved: 28000 },
      { empIdx: 11, actIdx: 17, title: 'Database Connection Pool Auto-Tuner', date: '2026-10-18', status: 'Pending', mult: 1.5, timeSaved: 160, costSaved: 33000 },
      { empIdx: 13, actIdx: 94, title: 'Enterprise FinOps Cost Forecast Engine', date: '2026-10-21', status: 'Pending', mult: 2.0, timeSaved: 310, costSaved: 95000 },
      { empIdx: 12, actIdx: 38, title: 'Secrets Rotation Automation Pipeline', date: '2026-10-25', status: 'Pending', mult: 1.2, timeSaved: 85, costSaved: 18000 },
      { empIdx: 15, actIdx: 59, title: 'New-Hire Cloud Sandbox Onboarding Guide', date: '2026-10-28', status: 'Draft', mult: 1.0, timeSaved: 40, costSaved: 6000 },
      { empIdx: 16, actIdx: 12, title: 'CLI Log Parser Utility Scripts', date: '2026-09-14', status: 'Pending', mult: 1.0, timeSaved: 35, costSaved: 5000 },
      { empIdx: 17, actIdx: 28, title: 'Legacy Port Scanner Script', date: '2026-09-02', status: 'Rejected', mult: 1.2, timeSaved: 25, costSaved: 4000 },
      { empIdx: 14, actIdx: 49, title: 'Multi-Region Disaster Recovery Drill', date: '2026-10-02', status: 'Pending', mult: 1.5, timeSaved: 120, costSaved: 30000 }
    ];

    var contributions = [];
    var approvals = [];

    for (var idx = 0; idx < sampleSpecs.length; idx++) {
      var spec = sampleSpecs[idx];
      var emp = employees[spec.empIdx];
      var act = points_master[spec.actIdx] || points_master[0];
      var cid = 'CON-2026-' + String(idx + 101).padStart(4, '0');
      var isApproved = spec.status === 'Approved';
      var finalPts = isApproved ? Math.round(act.defaultPoints * spec.mult) : 0;

      var teamAllocations = spec.teamSplit
        ? spec.teamSplit.map(function (s) {
            return { employeeId: employees[s.empIdx].id, employeeName: employees[s.empIdx].name, percentage: s.pct };
          })
        : [{ employeeId: emp.id, employeeName: emp.name, percentage: 100 }];

      var history = [
        {
          id: 'AH-' + idx + '-1',
          stage: 'Submission',
          reviewerId: emp.id,
          reviewerName: emp.name,
          decision: 'Submit',
          comments: 'Submitted with supporting evidence [DEMO DATA].',
          previousStatus: 'Draft',
          newStatus: spec.status === 'Draft' ? 'Draft' : 'Pending',
          timestamp: spec.date + 'T09:30:00.000Z'
        }
      ];

      var reviewerName = '';
      if (isApproved) {
        reviewerName = 'Marcus Vance';
        history.push({
          id: 'AH-' + idx + '-2',
          stage: 'Manager Review',
          reviewerId: 'EMP-002',
          reviewerName: reviewerName,
          decision: 'Approve',
          comments: 'Verified measurable impact and evidence.',
          previousStatus: 'Pending',
          newStatus: 'Approved',
          multiplierApplied: spec.mult,
          timestamp: spec.date + 'T15:00:00.000Z'
        });
        approvals.push({
          id: 'APR-' + (idx + 1),
          contributionId: cid,
          contributionTitle: spec.title,
          employeeId: emp.id,
          employeeName: emp.name,
          stage: 'Manager Review',
          reviewerId: 'EMP-002',
          reviewerName: reviewerName,
          decision: 'Approve',
          comments: 'Verified measurable impact and evidence.',
          previousStatus: 'Pending',
          newStatus: 'Approved',
          timestamp: spec.date + 'T15:00:00.000Z',
          isDemo: true
        });
      } else if (spec.status === 'Rejected') {
        reviewerName = 'Vikram Patel';
        history.push({
          id: 'AH-' + idx + '-2',
          stage: 'Manager Review',
          reviewerId: 'EMP-007',
          reviewerName: reviewerName,
          decision: 'Reject',
          comments: 'Duplicate capability already exists in enterprise security toolkit.',
          previousStatus: 'Pending',
          newStatus: 'Rejected',
          timestamp: spec.date + 'T16:10:00.000Z'
        });
      }

      contributions.push({
        id: cid,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        teamId: emp.teamId,
        teamName: emp.teamName,
        projectId: emp.projectId,
        projectName: emp.projectName,
        categoryId: act.categoryId,
        categoryName: act.categoryName,
        activityId: act.id,
        activityName: act.name,
        title: spec.title,
        description: 'Delivered ' + spec.title + ' for ' + emp.projectName + ' [DEMO DATA].',
        businessProblem: 'Manual operational overhead and recurring delivery bottlenecks.',
        solutionImplemented: 'Engineered and rolled out ' + spec.title + ' following CIS standards.',
        contributionType: spec.teamSplit ? 'Team' : 'Individual',
        teamAllocations: teamAllocations,
        deliverableVersion: 'v1.' + (idx % 4),
        evidence: 'https://cis-repo.internal/evidence/' + cid.toLowerCase(),
        expectedImpact: 'Reduce manual operational effort and improve delivery consistency.',
        actualImpact: 'Verified post-rollout effort saved: ' + spec.timeSaved + ' hrs/yr (~$' + spec.costSaved.toLocaleString() + ')',
        baselineMeasurement: String(Math.round(spec.timeSaved * 1.4)),
        actualMeasurement: String(Math.round(spec.timeSaved * 0.4)),
        measurementUnit: 'Hours',
        baselineImpact: 'Baseline manual effort: ' + Math.round(spec.timeSaved * 1.4) + ' hrs/yr prior to rollout',
        reuseAdoptionEvidence: 'Adopted in delivery pipelines with verified runbook validation.',
        distinctProjectsInvolved: emp.projectName,
        distinctProjectsReused: act.categoryId === 'CAT-03' ? 3 : (spec.mult >= 1.5 ? 2 : 1),
        measurableImpact: 'Saved ' + spec.timeSaved + ' hrs and ~$' + spec.costSaved.toLocaleString() + ' annually.',
        timeSavedHours: spec.timeSaved,
        costSavedUsd: spec.costSaved,
        qualityImprovement: 'Reduced defect escape rate by 35%.',
        securityImprovement: 'Aligned with CIS Level 2 security baseline.',
        reusabilityScalability: 'Packaged for multi-team adoption across CIS.',
        contributionDate: spec.date,
        additionalComments: 'DEMO DATA record for portal validation.',
        basePoints: act.defaultPoints,
        requestedMultiplier: spec.mult,
        approvedMultiplier: isApproved ? spec.mult : 1.0,
        finalPoints: finalPts,
        reviewerName: reviewerName,
        status: spec.status,
        submissionDate: spec.date + 'T09:30:00.000Z',
        approvedDate: isApproved ? spec.date + 'T15:00:00.000Z' : null,
        approvalHistory: history,
        isDemo: true
      });
    }

    var annual_points = [];
    var currentYear = 2026;

    for (var eIdx = 0; eIdx < employees.length; eIdx++) {
      var employee = employees[eIdx];
      var lifetime = 0;
      var annual = 0;
      var annualCount = 0;

      for (var k = 0; k < contributions.length; k++) {
        var c = contributions[k];
        if (c.status !== 'Approved') continue;
        var alloc = null;
        for (var a = 0; a < c.teamAllocations.length; a++) {
          if (c.teamAllocations[a].employeeId === employee.id) {
            alloc = c.teamAllocations[a];
            break;
          }
        }
        if (!alloc) continue;
        var pts = Math.round((c.finalPoints * alloc.percentage) / 100);
        lifetime += pts;
        var yr = new Date(c.contributionDate).getFullYear();
        if (yr === currentYear) {
          annual += pts;
          annualCount += 1;
        }
      }

      employee.lifetimePoints = lifetime;
      employee.annualPoints = annual;

      var earned = badges.filter(function (b) { return lifetime >= b.minPoints; })
        .sort(function (a, b) { return a.minPoints - b.minPoints; });
      employee.currentBadge = earned.length > 0 ? earned[earned.length - 1].name : 'None';
      employee.badgeHistory = earned.map(function (b) {
        return {
          badgeId: b.id,
          badgeName: b.name,
          achievedDate: '2026-06-01',
          lifetimePointsAtAchievement: lifetime
        };
      });

      if (annual > 0) {
        annual_points.push({
          id: 'AP-' + currentYear + '-' + employee.id,
          employeeId: employee.id,
          employeeName: employee.name,
          year: currentYear,
          points: annual,
          contributionsCount: annualCount
        });
      }
    }

    var specialist_nominations = [
      {
        id: 'NOM-001',
        badgeId: 'SB-11',
        badgeName: 'Automation Champion',
        nomineeId: 'EMP-011',
        nomineeName: 'Aarav Mehta',
        nominatorId: 'EMP-002',
        nominatorName: 'Marcus Vance',
        evidence: 'https://cis-repo.internal/automation-framework',
        achievements: 'Built Terraform & self-healing K8s frameworks saving 600+ hours.',
        status: 'Approved',
        reviewerId: 'EMP-007',
        reviewerName: 'Vikram Patel',
        reviewerComments: 'Verified technical rigor and multi-team adoption.',
        leaderId: 'EMP-009',
        leaderName: 'Catherine Brooks',
        leaderComments: 'Approved by CIS Council.',
        createdAt: '2026-04-10T10:00:00.000Z',
        updatedAt: '2026-04-18T14:00:00.000Z',
        isDemo: true
      },
      {
        id: 'NOM-002',
        badgeId: 'SB-12',
        badgeName: 'Quality & Resilience Champion',
        nomineeId: 'EMP-013',
        nomineeName: 'Liam OConnor',
        nominatorId: 'EMP-004',
        nominatorName: 'David Kim',
        evidence: 'https://cis-repo.internal/zero-trust-iam',
        achievements: 'Led Zero-Trust IAM rollout and automated SOC2 evidence collection.',
        status: 'Reviewer Endorsed',
        reviewerId: 'EMP-008',
        reviewerName: 'Sophia Lindqvist',
        reviewerComments: 'Strong security & resilience impact. Ready for Practice Leader approval.',
        createdAt: '2026-10-05T11:00:00.000Z',
        updatedAt: '2026-10-09T15:30:00.000Z',
        isDemo: true
      },
      {
        id: 'NOM-003',
        badgeId: 'SB-04',
        badgeName: 'Reuse Champion',
        nomineeId: 'EMP-014',
        nomineeName: 'Neha Deshmukh',
        nominatorId: 'EMP-005',
        nominatorName: 'Ananya Sharma',
        evidence: 'https://cis-repo.internal/aiops-sdk',
        achievements: 'Published AIOps Anomaly Detection SDK adopted by 4 teams.',
        status: 'Pending Review',
        createdAt: '2026-10-20T09:15:00.000Z',
        updatedAt: '2026-10-20T09:15:00.000Z',
        isDemo: true
      }
    ];

    var assets = [
      {
        id: 'AST-001',
        name: 'CIS Cloud Landing Zone Blueprint',
        category: 'Infrastructure as Code',
        description: 'Standardized multi-account cloud landing zone with built-in guardrails [DEMO DATA].',
        creatorId: 'EMP-011',
        creatorName: 'Aarav Mehta',
        teamId: 'TM-01',
        teamName: 'Cloud Platform Ops',
        projectId: 'PRJ-01',
        projectName: 'Project Horizon Cloud Migration',
        technology: 'Terraform, AWS, OPA',
        businessProblem: 'Inconsistent cloud account provisioning taking 3 weeks per project.',
        solution: 'Modular IaC blueprint provisioning compliant environments in 45 minutes.',
        supportingDocs: 'https://cis-wiki.internal/landing-zone',
        repositoryLink: 'https://cis-git.internal/cis/landing-zone',
        creationDate: '2026-01-15',
        validationOwnerId: 'EMP-007',
        validationOwnerName: 'Vikram Patel',
        adoptionTeams: ['Cloud Platform Ops', 'Site Reliability', 'Enterprise Delivery'],
        adoptionCount: 3,
        reuseCount: 14,
        measurableValue: '85% faster environment spin-up across 14 deployments.',
        estimatedTimeSavedHours: 480,
        estimatedCostSavedUsd: 92000,
        currentStage: 'Measure Value',
        approvalStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'AST-002',
        name: 'AIOps Anomaly Detection SDK',
        category: 'AI / Automation',
        description: 'Reusable Python SDK for streaming metric anomaly detection [DEMO DATA].',
        creatorId: 'EMP-014',
        creatorName: 'Neha Deshmukh',
        teamId: 'TM-04',
        teamName: 'AI & Automation Lab',
        projectId: 'PRJ-04',
        projectName: 'AIOps Self-Healing Platform',
        technology: 'Python, Prometheus, FastAPI',
        businessProblem: 'Alert fatigue from static threshold monitoring.',
        solution: 'Adaptive ML-based anomaly detector with Slack/PagerDuty hooks.',
        supportingDocs: 'https://cis-wiki.internal/aiops-sdk',
        repositoryLink: 'https://cis-git.internal/cis/aiops-sdk',
        creationDate: '2026-02-20',
        validationOwnerId: 'EMP-007',
        validationOwnerName: 'Vikram Patel',
        adoptionTeams: ['AI & Automation Lab', 'Site Reliability'],
        adoptionCount: 2,
        reuseCount: 9,
        measurableValue: '42% reduction in false-positive alerts.',
        estimatedTimeSavedHours: 340,
        estimatedCostSavedUsd: 58000,
        currentStage: 'Adopt',
        approvalStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'AST-003',
        name: 'Zero-Trust IAM Policy Pack',
        category: 'Security Framework',
        description: 'CIS-hardened IAM least-privilege policy templates [DEMO DATA].',
        creatorId: 'EMP-013',
        creatorName: 'Liam OConnor',
        teamId: 'TM-03',
        teamName: 'Cyber Defense & IAM',
        projectId: 'PRJ-03',
        projectName: 'Zero-Trust IAM Modernization',
        technology: 'AWS IAM, Azure RBAC, Rego',
        businessProblem: 'Over-privileged service accounts flagged in audits.',
        solution: 'Automated policy generator and drift checker.',
        supportingDocs: 'https://cis-wiki.internal/iam-pack',
        repositoryLink: 'https://cis-git.internal/cis/iam-pack',
        creationDate: '2026-04-12',
        validationOwnerId: 'EMP-008',
        validationOwnerName: 'Sophia Lindqvist',
        adoptionTeams: ['Cyber Defense & IAM'],
        adoptionCount: 1,
        reuseCount: 5,
        measurableValue: 'Zero critical IAM audit findings in Q2-Q3.',
        estimatedTimeSavedHours: 160,
        estimatedCostSavedUsd: 34000,
        currentStage: 'Publish',
        approvalStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'AST-004',
        name: 'Canary Rollback Operator',
        category: 'DevOps / SRE',
        description: 'Kubernetes operator for automated canary health checks [DEMO DATA].',
        creatorId: 'EMP-012',
        creatorName: 'Maya Lin',
        teamId: 'TM-02',
        teamName: 'Site Reliability',
        projectId: 'PRJ-02',
        projectName: 'Zero-Downtime Core SRE',
        technology: 'Go, Kubernetes, Argo Rollouts',
        businessProblem: 'Manual rollbacks during failed releases causing 15-min outages.',
        solution: 'Automated SLO-driven rollback operator.',
        supportingDocs: 'https://cis-wiki.internal/canary-op',
        repositoryLink: 'https://cis-git.internal/cis/canary-op',
        creationDate: '2026-08-01',
        validationOwnerId: 'EMP-007',
        validationOwnerName: 'Vikram Patel',
        adoptionTeams: [],
        adoptionCount: 0,
        reuseCount: 2,
        measurableValue: 'MTTR reduced from 15 mins to under 90 seconds.',
        estimatedTimeSavedHours: 110,
        estimatedCostSavedUsd: 22000,
        currentStage: 'Standardize',
        approvalStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'AST-005',
        name: 'FinOps Tagging & Cost Alert Kit',
        category: 'FinOps / Analytics',
        description: 'Automated cloud resource tagging validator [DEMO DATA].',
        creatorId: 'EMP-016',
        creatorName: 'Hannah Abbott',
        teamId: 'TM-01',
        teamName: 'Cloud Platform Ops',
        projectId: 'PRJ-01',
        projectName: 'Project Horizon Cloud Migration',
        technology: 'Python, AWS Lambda',
        businessProblem: 'Untagged cloud workloads obscuring cost attribution.',
        solution: 'Event-driven tag enforcement and daily cost digest.',
        supportingDocs: 'https://cis-wiki.internal/finops-kit',
        repositoryLink: 'https://cis-git.internal/cis/finops-kit',
        creationDate: '2026-10-05',
        validationOwnerId: 'EMP-007',
        validationOwnerName: 'Vikram Patel',
        adoptionTeams: [],
        adoptionCount: 0,
        reuseCount: 0,
        measurableValue: 'Pending validation.',
        estimatedTimeSavedHours: 60,
        estimatedCostSavedUsd: 15000,
        currentStage: 'Validate',
        approvalStatus: 'Pending',
        isDemo: true
      },
      {
        id: 'AST-006',
        name: 'Automated Incident Postmortem Generator',
        category: 'Knowledge & Ops',
        description: 'Drafts structured RCA templates from incident timelines [DEMO DATA].',
        creatorId: 'EMP-017',
        creatorName: 'Karan Malhotra',
        teamId: 'TM-04',
        teamName: 'AI & Automation Lab',
        projectId: 'PRJ-04',
        projectName: 'AIOps Self-Healing Platform',
        technology: 'TypeScript, Slack API',
        businessProblem: 'Engineers spend 4+ hours compiling incident timelines.',
        solution: 'Automated timeline aggregator and RCA template builder.',
        supportingDocs: 'https://cis-wiki.internal/rca-gen',
        repositoryLink: 'https://cis-git.internal/cis/rca-gen',
        creationDate: '2026-10-22',
        validationOwnerId: 'EMP-007',
        validationOwnerName: 'Vikram Patel',
        adoptionTeams: [],
        adoptionCount: 0,
        reuseCount: 0,
        measurableValue: 'Estimated 3 hours saved per incident.',
        estimatedTimeSavedHours: 45,
        estimatedCostSavedUsd: 8000,
        currentStage: 'Create',
        approvalStatus: 'Pending',
        isDemo: true
      }
    ];

    var rewards = [
      { id: 'RWD-01', name: 'Bronze Contributor — Certificate / Non-Cash Recognition', eligibility: 'Bronze Contributor (25+ pts)', pointsRequirement: 25, rewardType: 'Certificate / Non-Cash', approvalRequirement: 'HR & Practice Leadership', availability: 'Ongoing', status: 'Proposed', isDemo: true },
      { id: 'RWD-02', name: 'Silver Achiever — Indicative Reward ₹1,000–₹2,000', eligibility: 'Silver Achiever (75+ pts)', pointsRequirement: 75, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Leadership', availability: 'Quarterly', status: 'Proposed', isDemo: true },
      { id: 'RWD-03', name: 'Gold Excellence — Indicative Reward ₹3,000–₹5,000', eligibility: 'Gold Excellence (150+ pts)', pointsRequirement: 150, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Leadership', availability: 'Quarterly', status: 'Proposed', isDemo: true },
      { id: 'RWD-04', name: 'Platinum Champion — Indicative Reward ₹7,500–₹10,000', eligibility: 'Platinum Champion (300+ pts)', pointsRequirement: 300, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Leadership', availability: 'Bi-Annual', status: 'Proposed', isDemo: true },
      { id: 'RWD-05', name: 'Diamond Innovator — Indicative Reward ₹15,000–₹25,000', eligibility: 'Diamond Innovator (500+ pts)', pointsRequirement: 500, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Leadership', availability: 'Annual', status: 'Proposed', isDemo: true },
      { id: 'RWD-06', name: 'Master of Excellence — Indicative Reward ₹40,000–₹60,000', eligibility: 'Master of Excellence (750+ pts)', pointsRequirement: 750, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Leadership', availability: 'Annual', status: 'Proposed', isDemo: true },
      { id: 'RWD-07', name: 'CIS Legend — Indicative Reward ₹1,00,000–₹1,50,000', eligibility: 'CIS Legend (1000+ pts)', pointsRequirement: 1000, rewardType: 'Indicative Financial Proposal', approvalRequirement: 'HR, Finance & CIS Council', availability: 'Annual', status: 'Proposed', isDemo: true }
    ];

    var settings = {
      id: 'app-settings',
      portalName: 'CIS Impact Points & Excellence Portal',
      currentCycleYear: 2026,
      duplicateCheckEnabled: true,
      duplicateWindowDays: 30,
      technicalValidationCategories: ['CAT-02', 'CAT-03', 'CAT-08'],
      leadershipApprovalCategories: [],
      multipliers: [
        {
          id: 'MUL-1',
          label: 'Standard / Meets acceptance criteria',
          value: 1.0,
          guidance: '1.0× Standard — Meets all baseline framework acceptance criteria with verified evidence for single-project delivery.',
          requiresEvidence: false,
          requiresLeadershipApproval: false,
          active: true
        },
        {
          id: 'MUL-2',
          label: 'Strong quality & measurable lift',
          value: 1.2,
          guidance: '1.2× High Quality — Demonstrates strong technical rigor, clean documentation, and measurable baseline-vs-actual improvement.',
          requiresEvidence: true,
          requiresLeadershipApproval: false,
          active: true
        },
        {
          id: 'MUL-3',
          label: 'Significant multi-team / delivery impact',
          value: 1.5,
          guidance: '1.5× High Impact — Verified reuse across 2–3+ projects, major SLA/cost savings, or significant customer/presales value.',
          requiresEvidence: true,
          requiresLeadershipApproval: false,
          active: true
        },
        {
          id: 'MUL-4',
          label: 'Strategic practice-wide transformation',
          value: 2.0,
          guidance: '2.0× Strategic — Practice-wide adoption (5+ projects), patented IP, flagship customer deal win, or transformative CIS-wide impact (requires Leadership/Council sign-off).',
          requiresEvidence: true,
          requiresLeadershipApproval: true,
          active: true
        }
      ]
    };

    return {
      employees: employees,
      contributions: contributions,
      points_master: points_master,
      badges: badges,
      specialist_badges: specialist_badges,
      specialist_nominations: specialist_nominations,
      approvals: approvals,
      assets: assets,
      annual_points: annual_points,
      rewards: rewards,
      settings: [settings],
      projects: projects,
      teams: teams
    };
  };
})();
