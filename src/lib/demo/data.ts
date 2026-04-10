import { User, Report, FileAttachment } from '@/types';

// demo users with local names
export const demoUsers: User[] = [
  {
    id: 'admin-001',
    name: 'Tawanda Mutasa',
    email: 'tawanda@demo.com',
    role: 'admin',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'worker-001',
    name: 'Chiedza Moyo',
    email: 'chiedza@demo.com',
    role: 'worker',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'worker-002',
    name: 'Tendai Nkomo',
    email: 'tendai@demo.com',
    role: 'worker',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'worker-003',
    name: 'Kudakwashe Chiweshe',
    email: 'kuda@demo.com',
    role: 'worker',
    createdAt: new Date('2024-03-01'),
  },
];

// quick login shortcuts
export const demoCredentials = [
  { email: 'tawanda@demo.com', password: 'demo123', role: 'admin', name: 'Tawanda Mutasa' },
  { email: 'chiedza@demo.com', password: 'demo123', role: 'worker', name: 'Chiedza Moyo' },
  { email: 'tendai@demo.com', password: 'demo123', role: 'worker', name: 'Tendai Nkomo' },
  { email: 'kuda@demo.com', password: 'demo123', role: 'worker', name: 'Kudakwashe Chiweshe' },
];

// fake file storage - just for demo
const fileStore: Map<string, { data: string; type: string; name: string }> = new Map();

// generate some fake research reports
function generateDemoReports(): Report[] {
  const reports: Report[] = [
    // Chiedza's reports
    {
      id: 'report-001',
      userId: 'worker-001',
      userName: 'Chiedza Moyo',
      title: 'Supply Chain Disruptions Analysis',
      problem: 'Local manufacturing companies are experiencing severe supply chain disruptions that are affecting production schedules, increasing operational costs, and causing loss of customers. The disruptions stem from import restrictions, currency fluctuations, and limited local supplier networks. Companies report delays of 2-6 months in receiving raw materials, forcing many to halt production lines intermittently.',
      findings: 'Comprehensive research involving 45 manufacturing companies revealed: (1) 78% of companies experienced significant delays due to import restrictions and bureaucratic processes, (2) 65% reported 30-50% increased costs from alternative sourcing arrangements, (3) 45% lost customers due to delivery delays, (4) Only 22% have established relationships with local suppliers, (5) Average lead time increased from 4 weeks to 14 weeks over the past 2 years. Currency volatility adds an additional 15-25% cost variance.',
      solutions: 'Recommended strategies include: (1) Develop local supplier networks through partnership programs with local raw material producers - potential to reduce import dependency by 40%, (2) Implement inventory buffer strategies with 3-month safety stock for critical materials, (3) Establish regional sourcing partnerships in neighboring countries to diversify supply sources, (4) Create a shared procurement consortium among small manufacturers to achieve economies of scale, (5) Invest in supply chain visibility technology to improve planning accuracy.',
      status: 'completed',
      attachments: [
        {
          id: 'file-001',
          name: 'Supply_Chain_Report_Q1.pdf',
          type: 'application/pdf',
          size: 245760,
          url: '/api/files/file-001',
          uploadedAt: new Date('2024-03-25T14:30:00'),
        }
      ],
      createdAt: new Date('2024-03-25T14:30:00'),
      updatedAt: new Date('2024-03-25T14:30:00'),
    },
    {
      id: 'report-002',
      userId: 'worker-001',
      userName: 'Chiedza Moyo',
      title: 'Employee Retention Challenges Study',
      problem: 'The retail sector is experiencing unprecedented staff turnover rates exceeding 60% annually. This high turnover is causing significant operational disruptions, increased training costs, loss of institutional knowledge, and declining customer service quality. Companies are struggling to maintain consistent workforce levels, with some stores operating at 70% capacity during peak periods.',
      findings: 'Initial interviews with 15 retail companies and survey data from 200+ employees reveal: (1) 80% cite low wages as primary reason for leaving - average salaries are 35% below regional benchmarks, (2) 65% point to lack of career growth opportunities and unclear promotion paths, (3) 55% report poor working conditions including long hours without overtime pay, (4) 48% experienced inadequate onboarding and training, (5) Exit interviews show that 70% of departing employees had been with the company less than 18 months, (6) Average cost per turnover incident is estimated at $3,500 including recruitment and training.',
      solutions: 'Proposed solutions under development: (1) Implement competitive salary benchmarking and adjustment program to align with regional standards, (2) Create clear career progression frameworks with defined milestones and promotion criteria, (3) Develop comprehensive onboarding and mentorship programs, (4) Introduce performance-based incentives and employee recognition programs, (5) Improve working conditions through better scheduling and work-life balance initiatives. Currently analyzing additional survey data to refine recommendations.',
      status: 'in-progress',
      attachments: [
        {
          id: 'file-002',
          name: 'Employee_Survey_Data.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 102400,
          url: '/api/files/file-002',
          uploadedAt: new Date('2024-03-26T09:00:00'),
        },
        {
          id: 'file-003',
          name: 'Interview_Notes.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 51200,
          url: '/api/files/file-003',
          uploadedAt: new Date('2024-03-26T10:00:00'),
        }
      ],
      createdAt: new Date('2024-03-26T09:00:00'),
      updatedAt: new Date('2024-03-27T08:00:00'),
    },
    {
      id: 'report-003',
      userId: 'worker-001',
      userName: 'Chiedza Moyo',
      title: 'Digital Transformation Barriers',
      problem: 'Small and medium enterprises are struggling to adopt digital technologies necessary for modern business operations. Many companies are falling behind competitors due to outdated systems, manual processes, and inability to leverage digital tools for customer engagement, operations management, and data-driven decision making. The digital divide is widening between larger corporations and SMEs.',
      findings: 'Research blocked - unable to complete data collection. Need formal approval from 3 target companies to conduct technical assessments of their IT infrastructure. Initial preliminary findings from available sources suggest: limited IT budgets, lack of technical expertise, and resistance to change as major barriers.',
      solutions: 'Unable to develop comprehensive solutions until research is completed. Preliminary recommendations include digital skills training programs and technology adoption grants for SMEs. Need management letters from participating organizations to proceed.',
      status: 'blocked',
      attachments: [],
      createdAt: new Date('2024-03-27T07:00:00'),
      updatedAt: new Date('2024-03-27T07:00:00'),
    },
    // Tendai's reports
    {
      id: 'report-004',
      userId: 'worker-002',
      userName: 'Tendai Nkomo',
      title: 'Access to Finance for SMEs',
      problem: 'Small and Medium Enterprises (SMEs) face significant challenges accessing financing for business growth and operations. Traditional banking institutions have stringent requirements that most SMEs cannot meet, forcing many businesses to rely on expensive informal lending sources or remain undercapitalized. This financing gap is estimated at over $2 billion annually and is a major constraint on economic growth and job creation.',
      findings: 'Comprehensive study involving 120 SMEs and 15 financial institutions revealed: (1) 85% of SMEs struggle to access bank loans due to collateral requirements averaging 150% of loan value, (2) 72% lack formal financial records required by banks, (3) 68% have been rejected for financing at least once, (4) Average interest rates from informal lenders range from 30-50% compared to 15-20% from formal sources, (5) Only 12% of SMEs are aware of available government support programs, (6) 40% of SMEs operate entirely in the informal sector, further limiting financing options. Case studies of 20 successful SMEs showed that diversified funding sources were key to growth.',
      solutions: 'Recommendations for improving SME access to finance: (1) Develop credit guarantee schemes to reduce collateral requirements - target 60% guarantee coverage, (2) Create SME-focused financial literacy programs covering record-keeping and financial management, (3) Expand microfinance institution networks to underserved areas, (4) Establish government-backed venture capital funds for high-growth SMEs, (5) Simplify application processes for existing support programs and increase awareness campaigns, (6) Develop alternative credit scoring models using mobile money and utility payment history, (7) Create SME formalization incentives to bring more businesses into the formal financial system.',
      status: 'completed',
      attachments: [
        {
          id: 'file-004',
          name: 'SME_Financing_Study.pdf',
          type: 'application/pdf',
          size: 512000,
          url: '/api/files/file-004',
          uploadedAt: new Date('2024-03-24T10:00:00'),
        }
      ],
      createdAt: new Date('2024-03-24T10:00:00'),
      updatedAt: new Date('2024-03-25T15:00:00'),
    },
    {
      id: 'report-005',
      userId: 'worker-002',
      userName: 'Tendai Nkomo',
      title: 'Regulatory Compliance Costs Research',
      problem: 'Businesses across multiple sectors are burdened by excessive regulatory compliance requirements that consume significant resources and stifle growth. The complexity of navigating multiple regulatory bodies, obtaining various licenses and permits, and maintaining ongoing compliance creates barriers to entry for new businesses and operational inefficiencies for existing ones. Many business owners report spending more time on compliance than on core business activities.',
      findings: 'Currently collecting comprehensive data from 50 businesses across different sectors. Initial findings suggest: (1) Companies spend an average of 15% of operating costs on regulatory compliance including licensing fees, compliance staff, and consultant services, (2) Average time to obtain all necessary permits for a new business is 6-8 months, (3) Multiple regulatory bodies often have overlapping requirements creating duplication of effort, (4) 65% of surveyed businesses report that compliance complexity discourages expansion plans, (5) Small businesses are disproportionately affected as they lack dedicated compliance staff. Survey completion rate is currently at 60%.',
      solutions: 'Preliminary solution frameworks being developed: (1) One-stop-shop for business registration and licensing to reduce processing time by 50%, (2) Regulatory impact assessments before new regulations are introduced, (3) Tiered compliance requirements based on business size - simplified requirements for micro and small businesses, (4) Digital transformation of regulatory processes to reduce paperwork and processing times, (5) Regular regulatory audits to identify and eliminate redundant requirements. Full recommendations pending completion of data collection.',
      status: 'in-progress',
      attachments: [
        {
          id: 'file-005',
          name: 'Compliance_Survey_Forms.zip',
          type: 'application/zip',
          size: 307200,
          url: '/api/files/file-005',
          uploadedAt: new Date('2024-03-27T04:00:00'),
        }
      ],
      createdAt: new Date('2024-03-27T04:00:00'),
      updatedAt: new Date('2024-03-27T10:00:00'),
    },
    // Kudakwashe's reports
    {
      id: 'report-006',
      userId: 'worker-003',
      userName: 'Kudakwashe Chiweshe',
      title: 'Infrastructure Impact on Business',
      problem: 'Inadequate infrastructure is severely hampering business operations and economic development across the country. Power outages, water shortages, poor road networks, and unreliable internet connectivity are causing significant productivity losses, increased operational costs, and reduced competitiveness in both local and international markets. Many businesses have been forced to invest in expensive backup systems or reduce operations.',
      findings: 'Survey of 200 businesses across various sectors and regions revealed: (1) 92% of companies affected by power outages - averaging 8 hours daily in some areas, (2) 45% experience regular water shortages affecting production and hygiene standards, (3) 78% report poor road networks causing logistics delays and vehicle damage, (4) 67% struggle with unreliable internet connectivity impacting communication and digital operations, (5) Average revenue losses of 12% attributed directly to infrastructure issues, (6) 55% have invested in backup generators at significant cost - averaging $15,000 per installation, (7) Transportation costs are 40% higher than regional averages due to road conditions. Manufacturing and tourism sectors are most severely impacted.',
      solutions: 'Infrastructure improvement recommendations: (1) Advocate for increased investment in power generation and distribution infrastructure - target 95% reliability, (2) Develop alternative water sources and storage systems for businesses in affected areas, (3) Prioritize road rehabilitation on key commercial transport routes, (4) Expand fiber optic network to improve internet reliability and reduce costs, (5) Create special economic zones with guaranteed infrastructure reliability, (6) Establish public-private partnerships for infrastructure development and maintenance, (7) Develop infrastructure monitoring and reporting systems to enable faster response to issues. Estimated total investment needed: $5 billion over 10 years.',
      status: 'completed',
      attachments: [
        {
          id: 'file-006',
          name: 'Infrastructure_Impact_Analysis.pdf',
          type: 'application/pdf',
          size: 86000,
          url: '/api/files/file-006',
          uploadedAt: new Date('2024-03-23T11:00:00'),
        }
      ],
      createdAt: new Date('2024-03-23T11:00:00'),
      updatedAt: new Date('2024-03-24T16:00:00'),
    },
    {
      id: 'report-007',
      userId: 'worker-003',
      userName: 'Kudakwashe Chiweshe',
      title: 'Skills Gap in Technical Industries',
      problem: 'Technical industries including manufacturing, engineering, and information technology are facing acute shortages of qualified personnel. Despite high unemployment rates, companies cannot find workers with the necessary technical skills. This skills mismatch is limiting industrial growth, reducing productivity, and forcing companies to rely on expensive foreign expertise or leave positions unfilled for extended periods.',
      findings: 'Ongoing research involving industry associations and training institutions has identified: (1) 70% of surveyed companies report difficulties finding qualified technicians and engineers, (2) Average time to fill technical positions is 4-6 months, (3) 55% of IT positions remain unfilled for over 3 months, (4) Skills most in demand include: advanced manufacturing techniques, industrial automation, software development, and project management, (5) 65% of graduates from technical institutions require significant retraining before they are job-ready, (6) 70% of companies have established internal training programs to bridge skills gaps, (7) Brain drain is significant - an estimated 5,000 technical professionals emigrate annually. Currently analyzing effectiveness of existing training programs.',
      solutions: 'Solution frameworks under development: (1) Curriculum review and alignment with industry needs - partner with training institutions to update programs, (2) Expand apprenticeship and internship programs with tax incentives for participating companies, (3) Establish industry-specific training centers with modern equipment, (4) Develop retention strategies for technical professionals including competitive packages and career development, (5) Create diaspora engagement programs to leverage expertise of professionals abroad, (6) Implement certification and continuous professional development programs, (7) Introduce vocational training pathways from secondary school level.',
      status: 'in-progress',
      attachments: [],
      createdAt: new Date('2024-03-27T06:00:00'),
      updatedAt: new Date('2024-03-27T11:00:00'),
    },
    {
      id: 'report-008',
      userId: 'worker-003',
      userName: 'Kudakwashe Chiweshe',
      title: 'Market Competition Analysis',
      problem: 'Companies are facing intense competition from both domestic and international players, but lack access to market intelligence needed to make strategic decisions. Many businesses struggle to understand competitive dynamics, identify market opportunities, and position themselves effectively. Limited access to market data and competitive intelligence is putting local businesses at a disadvantage.',
      findings: 'Research paused due to confidentiality concerns. Participating companies have expressed concerns about sharing sensitive competitive information. Initial limited data suggests: (1) Market concentration is increasing in several sectors, (2) Foreign competitors with better access to capital are gaining market share, (3) Local companies lack formal competitive intelligence capabilities.',
      solutions: 'Revised methodology being developed to address confidentiality concerns: (1) Anonymized data collection approach using third-party aggregation, (2) Secure data handling protocols with confidentiality agreements, (3) Sector-wide aggregated reports instead of company-specific analyses, (4) Optional participation with clear benefits communicated to participants. Awaiting approval of revised research proposal.',
      status: 'blocked',
      attachments: [
        {
          id: 'file-007',
          name: 'Revised_Research_Proposal.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 12000,
          url: '/api/files/file-007',
          uploadedAt: new Date('2024-03-25T08:00:00'),
        }
      ],
      createdAt: new Date('2024-03-25T08:00:00'),
      updatedAt: new Date('2024-03-26T09:00:00'),
    },
  ];

  return reports;
}

// fake reactive data store
class DemoStore {
  private reports: Report[] = [];
  private initialized = false;
  private reportSubscribers: Map<string, Set<(reports: Report[]) => void>> = new Map();
  private allReportsSubscribers: Set<(reports: Report[]) => void> = new Set();

  private ensureInitialized() {
    // don't init twice
    if (!this.initialized) {
      this.reports = generateDemoReports();
      this.initialized = true;
    }
  }

  // check login
  validateCredentials(email: string, password: string): User | null {
    const cred = demoCredentials.find(
      (c) => c.email === email && c.password === password
    );
    if (!cred) return null;
    return demoUsers.find((u) => u.email === email) || null;
  }

  // report helpers
  getUserReports(userId: string): Report[] {
    this.ensureInitialized();
    return this.reports.filter((r) => r.userId === userId);
  }

  getAllReports(): Report[] {
    this.ensureInitialized();
    return [...this.reports];
  }

  getReport(reportId: string): Report | null {
    this.ensureInitialized();
    return this.reports.find((r) => r.id === reportId) || null;
  }

  createReport(userId: string, userName: string, data: { title: string; problem: string; findings: string; solutions: string; status: 'in-progress' | 'completed' | 'blocked'; attachments?: FileAttachment[] }): Report {
    this.ensureInitialized();
    const report: Report = {
      id: `report-${Date.now()}`,
      userId,
      userName,
      title: data.title,
      problem: data.problem,
      findings: data.findings,
      solutions: data.solutions,
      status: data.status,
      attachments: data.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reports.unshift(report);
    this.notifySubscribers(userId);
    this.notifyAllSubscribers();
    return report;
  }

  updateReportStatus(reportId: string, status: 'in-progress' | 'completed' | 'blocked'): Report | null {
    this.ensureInitialized();
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return null;
    
    report.status = status;
    report.updatedAt = new Date();
    this.notifySubscribers(report.userId);
    this.notifyAllSubscribers();
    return report;
  }

  // file helpers
  storeFile(fileId: string, data: string, type: string, name: string): void {
    fileStore.set(fileId, { data, type, name });
  }

  getFile(fileId: string): { data: string; type: string; name: string } | null {
    return fileStore.get(fileId) || null;
  }

  // subscription helpers
  subscribeToUserReports(userId: string, callback: (reports: Report[]) => void): () => void {
    this.ensureInitialized();
    if (!this.reportSubscribers.has(userId)) {
      this.reportSubscribers.set(userId, new Set());
    }
    this.reportSubscribers.get(userId)!.add(callback);
    
    // send current data right away
    callback(this.getUserReports(userId));
    
    return () => {
      this.reportSubscribers.get(userId)?.delete(callback);
    };
  }

  subscribeToAllReports(callback: (reports: Report[]) => void): () => void {
    this.ensureInitialized();
    this.allReportsSubscribers.add(callback);
    callback(this.getAllReports());
    return () => {
      this.allReportsSubscribers.delete(callback);
    };
  }

  private notifySubscribers(userId: string) {
    const reports = this.getUserReports(userId);
    this.reportSubscribers.get(userId)?.forEach((cb) => cb(reports));
  }

  private notifyAllSubscribers() {
    const reports = this.getAllReports();
    this.allReportsSubscribers.forEach((cb) => cb(reports));
  }

  // admin needs user list
  getUsers(): User[] {
    return [...demoUsers];
  }
}

export const demoStore = new DemoStore();
