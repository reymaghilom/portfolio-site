import type { TechIconSlug } from "@/lib/tech-icons";

/**
 * All personal content for the portfolio lives here.
 * Source of truth: Rey C. Maghilom's resume. Keep entries faithful to it.
 */

export type NavItem = {
  id: string;
  label: string;
};

export type ProjectImage = {
  /** A path under /public (e.g. "/images/app.png") or a remote URL allowed in next.config.ts. */
  src: string;
  alt: string;
  /** Pixel size of the file. Taller-than-wide shots are shown in a phone-style frame. */
  width: number;
  height: number;
  /** Short name of the screen, shown beside the counter in the viewer (e.g. "Home"). */
  label?: string;
};

export type Project = {
  title: string;
  description: string;
  technologies: string[];
  /** Year from the resume, when documented. */
  year?: string;
  /** Who it was built for, shown as the card's label (e.g. internal company system vs personal). */
  context: string;
  /** Repository URL. Leave out to hide the "Source" link. */
  github?: string;
  /** Deployed site URL. Shows a "Launch site →" link on the card; leave out when not deployed. */
  live?: string;
  /** Real screenshots, main one first: it fronts the card; clicking it opens them all. */
  images?: ProjectImage[];
  /** Optional disclosure shown on the card and inside the screenshot viewer. */
  screenshotNote?: string;
};

export type Skill = {
  name: string;
  /** Brand mark and color from lib/tech-icons.ts (brands without an official mark show initials). */
  icon: TechIconSlug;
};

export type SkillGroup = {
  title: string;
  items: Skill[];
  description?: string;
};

/** Journey, first group: software work, internal or independent. */
export type DevelopmentEntry = {
  title: string;
  period: string;
  /** What kind of work it is, shown as the entry's chip ("Internal project"). */
  kind?: string;
  /** Who it was built for or under. */
  context: string;
  summary: string;
  /** What the software is for. */
  purpose?: string[];
  technologies?: string[];
  /** Named personal projects. Kept as data; not listed in Journey (they appear under Projects). */
  projects?: string[];
};

/** Journey, second group: latest employment only (a banking role, not IT), kept as context. */
export type Employment = {
  organization: string;
  roles: { title: string; period: string }[];
  /** Short note on how the roles got here, shown under them. */
  summary?: string;
};

export type ContactLink = {
  label: string;
  value: string;
  /** Leave out for details that aren't links (e.g. location). */
  href?: string;
  external?: boolean;
};

export const profile = {
  name: "Rey C. Maghilom",
  role: "ENTRY-LEVEL FULL STACK WEB AND MOBILE DEVELOPER",
  intro:
    "Building modern, responsive digital experiences while continuously developing my skills in web and mobile technologies.",
  location: "Manticao, Misamis Oriental",
  status: "Open to Web and Mobile App Development Opportunities",
  // The hero's "Download Resume" downloads this Word file (public/rey.docx).
  resume: "/rey.docx",
};

export const navItems: NavItem[] = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact Me" },
];

export const about: string[] = [
  "I’m Rey, an entry-level web and mobile developer who builds clean, responsive applications and turns ideas into practical solutions for real-world and client needs.",
  "I develop web and mobile applications focused on clean, responsive user experiences, leveraging AI-assisted tools across the software development lifecycle—from planning and implementation to debugging and refinement.",
];

// Compact education block under the About text; work history lives in Journey.
export const education = {
  school: "Mindanao State University at Naawan",
  location: "Naawan, Misamis Oriental",
  degree: "Bachelor of Science in Information Technology",
  period: "2011–2015",
  majors: ["Major in Database Management System"],
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    items: [
      { name: "Next.js", icon: "nextdotjs" },
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "HTML", icon: "html5" },
      { name: "CSS", icon: "css" },
    ],
  },
  {
    title: "Backend & Database",
    items: [
      { name: "Laravel", icon: "laravel" },
      { name: "PHP", icon: "php" },
      { name: "MySQL", icon: "mysql" },
      { name: "Supabase", icon: "supabase" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "REST API", icon: "restapi" },
    ],
  },
  {
    title: "Mobile Development",
    items: [
      { name: "React Native", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Expo", icon: "expo" },
      { name: "SQLite", icon: "sqlite" },
    ],
  },
  {
    title: "Tools & Services",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Visual Studio Code", icon: "visualstudiocode" },
      { name: "Vite", icon: "vite" },
      { name: "Cloudinary", icon: "cloudinary" },
      { name: "n8n Automation", icon: "n8n" },
      { name: "Google Cloud VPS", icon: "googlecloud" },
    ],
  },
  {
    title: "AI-Assisted Engineering",
    description:
      "Experienced in AI-assisted software and application development, leveraging modern tools such as Claude Code and OpenAI Codex.",
    items: [
      { name: "Claude Code", icon: "claudecode" },
      { name: "OpenAI Codex", icon: "openai" },
    ],
  },
];

// Add `github`, `live` or `images` to an entry only when a real URL / screenshot exists.
// To add a screenshot: put the file in public/images and add an entry to that project's
// `images` (src, a short alt description, and the file's pixel width/height).
// The first entry is shown as the featured project.
export const projects: Project[] = [
  {
    title: "Credit Investigation Management System",
    year: "2026",
    context: "Internal system",
    live: "https://cis.kesug.com",
    screenshotNote: "Screenshots use demo data and dummy accounts only.",
    images: [
      {
        src: "/images/credit-investigation/cims-1.png",
        label: "Sign In",
        alt: "Credit Investigation Management System sign-in page: the Binhi Rural Bank logo, email and password fields, Remember me, Forgot password and a Sign in button.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-dashboard.png",
        label: "Dashboard",
        alt: "CIMS Dashboard — Credit Investigation Management System",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-2.png",
        label: "Client Folders",
        alt: "Client Folders page: a sidebar with Dashboard, Client Folders, CI Activities and Reports, a client search with a Create Client Folder button, and a completed client folder.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-3.png",
        label: "Client Folders",
        alt: "Client Folders page: a sidebar with Dashboard, Client Folders, CI Activities and Reports, a client search with a Create Client Folder button, and a completed client folder.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-4.png",
        label: "Client Folder",
        alt: "An open client folder: folder contents for the CIBI report, business and income sources, residence and business report, and CI activities, beside a Recent Activity timeline.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-5.png",
        label: "CIBI Report",
        alt: "CIBI Report form: a credit investigation report with CI details, borrower and risk assessment, and validated personal and residence information, with an Update CIBI Report button.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-6.png",
        label: "Add Business",
        alt: "Businesses / Income Sources page with the Add Business dialog open, asking for a business template before continuing.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-7.png",
        label: "Residence & Business",
        alt: "Residence & Business Report page: Residence Check and Business Checks tables with dates, locations and the assigned investigator, plus bulk print and download actions.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-8.png",
        label: "CI Activities",
        alt: "CI Activities page: due today, scheduled, follow-up and completed counts, filters, and a table of completed barangay, neighbor, asset and bank checks with progress.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-9.png",
        label: "Reports",
        alt: "Reports page: totals for all, pending and completed reports, filters by report and client type, and a table of completed business, residence and CI/BI reports.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/credit-investigation/cims-10.png",
        label: "Folder Activities",
        alt: "A client folder’s CI Activities: barangay, neighbor, asset and bank / coop checks marked completed, with proof of submission, creator and last update.",
        width: 1440,
        height: 900,
      },
    ],
    description:
      "Built a web application used for internal digital filing, encoding, tracking, reporting, and document management for the Credit Investigation Team of Binhi Rural Bank Inc.",
    technologies: ["Laravel", "Vanilla JavaScript", "Tailwind CSS", "MySQL", "Cloudinary", "Vite"],
  },
  {
    title: "PisoWiFi Monitoring System",
    context: "Personal business project",
    live: "http://pesowifi.duckdns.org/",
    images: [
      {
        src: "/images/pisowifi-monitoring/login-page.png",
        label: "Login Page",
        alt: "PisoWiFi Monitoring sign-in page with email and password fields.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/pisowifi-monitoring/dashboard.png",
        label: "Dashboard",
        alt: "PisoWiFi Monitoring dashboard showing registered machines, connectivity, measured uptime, and recent status changes.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/pisowifi-monitoring/my-pisowifi.png",
        label: "My PisoWiFi",
        alt: "My PisoWiFi page listing two machines, software, connection status, and last check times; private addresses are redacted.",
        width: 1586,
        height: 992,
      },
      {
        src: "/images/pisowifi-monitoring/machine-details.png",
        label: "Machine Details",
        alt: "Machine Details page showing connectivity status, uptime, response time, outages, and machine actions; device identifiers are redacted.",
        width: 1586,
        height: 992,
      },
      {
        src: "/images/pisowifi-monitoring/monitoring-history.png",
        label: "Monitoring History",
        alt: "Monitoring History page with machine status timelines, outage events, uptime, and average response time charts.",
        width: 1440,
        height: 900,
      },
      {
        src: "/images/pisowifi-monitoring/remote-adminatration.png",
        label: "Remote Administration",
        alt: "Remote Administration page for choosing an online machine and opening its native administration dashboard through a secure gateway; private addresses are redacted.",
        width: 1586,
        height: 992,
      },
      {
        src: "/images/pisowifi-monitoring/add-pisowifi-machine.png",
        label: "Add Machine",
        alt: "Add machine form with software, network, and administration path fields; infrastructure values are redacted.",
        width: 1586,
        height: 992,
      },
      {
        src: "/images/pisowifi-monitoring/settings.png",
        label: "Settings",
        alt: "Settings profile page with account navigation and display name; the personal email address is redacted.",
        width: 1586,
        height: 992,
      },
    ],
    description:
      "A full-stack web application I developed for my personal PisoWiFi business to monitor the connectivity, uptime, and operational status of my WiFi5Soft machines. The system provides monitoring history, automated outage and recovery notifications, and secure remote administration through a gateway, allowing me to access each machine's native dashboard to check sales, CPU usage, and other operational information without physically visiting the machines.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "Fastify",
      "PostgreSQL",
      "Supabase",
      "ZeroTier",
      "Google Cloud Compute Engine",
      "n8n",
    ],
  },
  {
    title: "Reminder Mobile App",
    year: "2026",
    context: "Personal project",
    images: [
      {
        src: "/images/reminder-app/reminder-app-1.png",
        label: "Home",
        alt: "Reminder Mobile App home screen: Today’s Progress at 4 of 4 completed, and the timeline with Calciumade Tablet’s after-lunch dose marked taken.",
        width: 922,
        height: 2048,
      },
      {
        src: "/images/reminder-app/reminder-app-2.png",
        label: "Schedule",
        alt: "Vitamin Schedule screen: Iron at one daily dose (bedtime) and Calciumade Tablet at two daily doses, each with its time and a reminder toggle.",
        width: 922,
        height: 2048,
      },
      {
        src: "/images/reminder-app/reminder-app-3.png",
        label: "History",
        alt: "History screen: an October 2026 calendar with completion markers, and October 1 showing 4 of 4 doses confirmed as taken.",
        width: 922,
        height: 2048,
      },
      {
        src: "/images/reminder-app/reminder-app-4.png",
        label: "Add Supplement",
        alt: "Add Vitamin/Supplement form: name, brand and nutrient fields, with daily frequency options from once daily to custom.",
        width: 922,
        height: 2048,
      },
      {
        src: "/images/reminder-app/reminder-app-5.png",
        label: "About",
        alt: "About Reminder App screen: the app logo, a short description of the app, and the developer credit to Rey C. Maghilom.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/reminder-app/reminder-app-6.png",
        label: "Settings",
        alt: "Settings screen: reminder options for notification sound, vibration, repeat if not taken, repeat interval, maximum reminders and exact alarms.",
        width: 576,
        height: 1280,
      },
    ],
    description:
      "A mobile reminder application for managing vitamin and supplement schedules, reminders, and intake tracking, developed for personal use.",
    technologies: ["React Native", "TypeScript", "Expo", "SQLite"],
  },
  {
    title: "Expense Tracker Mobile App",
    year: "2026",
    context: "Personal project",
    images: [
      {
        src: "/images/expense-tracker/expense-tracker-1.png",
        label: "Analytics",
        alt: "Expense Tracker Analytics screen, scrolled down: Expenses by Category with Food at 100%, and Income by Category with Salary at 100%.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-2.png",
        label: "Monthly Analytics",
        alt: "Analytics screen for September 2026: ₱9,000.00 income, ₱1,000.00 expenses and an ₱8,000.00 balance, above Income vs Expense and Daily Spending charts.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-3.png",
        label: "Monthly Analytics",
        alt: "Analytics screen for September 2026: ₱9,000.00 income, ₱1,000.00 expenses and an ₱8,000.00 balance, above Income vs Expense and Daily Spending charts.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-4.png",
        label: "Income vs Expense",
        alt: "Analytics screen scrolled to the Income vs Expense bar chart, with the monthly totals above it and the Daily Spending chart below.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-5.png",
        label: "Transactions",
        alt: "Transactions screen: type and period filters, and four transactions grouped by date, including a ₱9,000.00 salary and a ₱1,000.00 food expense.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-6.png",
        label: "Home",
        alt: "Home screen scrolled down: the Income vs Expense chart and Recent Transactions, with today’s salary and food entries.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-7.png",
        label: "Home",
        alt: "Income & Expense Tracker home screen for September 2026: an ₱8,000.00 monthly balance card with income and expense totals, above the Income vs Expense chart.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-8.png",
        label: "Settings",
        alt: "Settings screen: appearance, language and date format preferences, then currency, category management, backup and restore, and CSV export.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-9.png",
        label: "Add Income",
        alt: "Add Income form: amount, category, date, received via, an optional note and receipt, and a Save Income button.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/expense-tracker/expense-tracker-10.png",
        label: "Add Expense",
        alt: "Add Expense form: amount, category, date, payment method, an optional note and receipt, and a Save Expense button.",
        width: 576,
        height: 1280,
      },
    ],
    description:
      "Developed a mobile expense tracking application to help manage and monitor household expenses and budgeting.",
    technologies: ["React Native", "TypeScript", "Expo", "SQLite"],
  },
  {
    title: "Sari-Sari Store Inventory and POS System",
    context: "Personal project",
    images: [
      {
        src: "/images/inventory&pos/sari-sari-store-1.png",
        label: "Owner PIN",
        alt: "Sari-sari Store sign-in screen: Enter PIN, with four PIN dots and a number keypad for owner access.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-2.png",
        label: "Inventory",
        alt: "Inventory screen with one product: product search with a barcode button, stock filters, and 1 Liter Coke under Beverages at ₱67.00 with 20 in stock.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-3.png",
        label: "Add Product",
        alt: "Add Product form: product image, name Salonpas, category Pharmaceutical, selling price 100, cost price 90, initial stock 20, a scanned barcode and a low stock alert toggle.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-4.png",
        label: "Inventory",
        alt: "Inventory screen with two products: Salonpas at ₱100.00 and 1 Liter Coke at ₱67.00, each with 20 in stock.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-5.png",
        label: "Checkout · Cash",
        alt: "Cart / Checkout screen: two items, a walk-in customer, Cash selected as the payment method, a cash received field and a ₱167.00 total.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-6.png",
        label: "Checkout · GCash",
        alt: "Cart / Checkout screen with GCash selected: an optional GCash reference field and a reminder to confirm the customer completed the transfer.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-7.png",
        label: "Checkout · Maya",
        alt: "Cart / Checkout screen with Maya selected: an optional Maya reference field and a reminder to confirm the customer completed the transfer.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-8.png",
        label: "Checkout · Utang",
        alt: "Cart / Checkout screen with Utang (credit) selected: a due date picker, optional notes, and a note to select a registered customer first.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-9.png",
        label: "Checkout",
        alt: "Cart / Checkout screen with ₱200 cash received and ₱33.00 change, the ₱167.00 total, and Save for Later and Checkout buttons.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-10.png",
        label: "Sale Completed",
        alt: "Sale Completed screen: the transaction number and sale summary, with buttons to view, share or print the receipt, print to a Bluetooth printer, or start a new sale.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-11.png",
        label: "Receipt",
        alt: "Receipt screen: an itemized Sari-sari Store receipt for Salonpas and 1 Liter Coke, a ₱167.00 total paid in cash, and Print Receipt and Share Receipt buttons.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-12.png",
        label: "Dashboard",
        alt: "Sari-sari Store home dashboard: today’s sales and profit, total products, low stock, customers and utang totals, and quick actions such as New Sale and Scan Barcode.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-13.png",
        label: "Scan Barcode",
        alt: "Scan Barcode result: Product Found, Salonpas at ₱100.00 with 19 in stock, a quantity selector, and Add to Cart and Scan Again buttons.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-14.png",
        label: "Add Customer",
        alt: "Add Customer form: full name, phone number, optional address and credit limit fields, with Cancel and Save Customer buttons.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-15.png",
        label: "Transaction Details",
        alt: "Transaction Details screen for a completed ₱167.00 cash sale, with View Receipt, Void Sale and Refund buttons.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-16.png",
        label: "Utang / Credit",
        alt: "Utang / Credit screen: total outstanding balance of ₱0.00, filters for due, overdue and paid, and no records yet.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-17.png",
        label: "Reports",
        alt: "Reports screen for this week’s sales: gross sales, voided sales, refunds, net sales, completed and voided counts, and total profit.",
        width: 576,
        height: 1280,
      },
      {
        src: "/images/inventory&pos/sari-sari-store-18.png",
        label: "Sales Trend",
        alt: "Reports screen scrolled down: a sales trend bar chart and a Top Products list with Salonpas and 1 Liter Coke.",
        width: 576,
        height: 1280,
      },
    ],
    description:
      "Developed a mobile inventory and point-of-sale application for my mother’s sari-sari store to support day-to-day store operations and improve product and sales management.",
    technologies: ["React Native", "TypeScript", "Expo", "SQLite"],
  },
];

// Journey: development work leads; banking employment follows as background.
export const developmentWork: DevelopmentEntry[] = [
  {
    title: "Credit Investigation Management System",
    period: "2026",
    kind: "Internal project",
    context: "Binhi Rural Bank Inc. · Credit Investigation Team",
    summary:
      "Internal company web application developed for the Credit Investigation Team of Binhi Rural Bank Inc. while I was working in credit investigation.",
    purpose: [
      "Streamline manual credit investigation work",
      "Digital filing",
      "Encoding",
      "Tracking",
      "Reporting",
      "Document management",
    ],
    technologies: ["Laravel", "Vanilla JavaScript", "Tailwind CSS", "MySQL", "Cloudinary", "Vite"],
  },
  {
    title: "Independent Web & Mobile Development",
    period: "Mid-2025 – Present",
    context: "Independent work",
    summary:
      "Started building personal projects during my free time to gain practical, hands-on software development experience.",
    projects: [
      "Sari-Sari Store Inventory & POS System",
      "Expense Tracker Mobile App",
      "Reminder Mobile App",
    ],
  },
];

// Journey: latest banking employment only (ended 2026), with its progression in `summary`;
// CARD SME Bank is on the resume, not the site.
export const employment: Employment[] = [
  {
    organization: "Binhi Rural Bank Inc.",
    roles: [{ title: "Senior Credit Investigator", period: "2025 – 2026" }],
    summary:
      "Banking career at Binhi Rural Bank: started as an Account Officer in 2019, then worked as a Credit Investigator (mid 2019–2025) before advancing to Senior Credit Investigator in 2025.",
  },
];

/** Where the contact links point and where the contact form's messages are delivered. */
export const contactEmail = "reycahansa@gmail.com";

export const contactLinks: ContactLink[] = [
  {
    label: "Email",
    value: contactEmail,
    href: `mailto:${contactEmail}`,
  },
  {
    label: "Phone",
    value: "+63 9972661147",
    href: "tel:+639972661147",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/rey-cahansa-13a37426b",
    href: "https://www.linkedin.com/in/rey-cahansa-13a37426b",
    external: true,
  },
  {
    label: "GitHub",
    value: "github.com/reymaghilom",
    href: "https://github.com/reymaghilom",
    external: true,
  },
  {
    label: "Location",
    value: profile.location,
  },
];
