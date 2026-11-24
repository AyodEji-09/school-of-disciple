export type FaqLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FaqItem = {
  id: string;
  categoryId: string;
  question: string;
  paragraphs: string[];
  links?: FaqLink[];
};

export type FaqCategory = {
  id: string;
  title: string;
  shortTitle: string;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "overview",
    title: "Overview & General Policy",
    shortTitle: "Overview",
  },
  {
    id: "registration",
    title: "Student & Center Registration Process",
    shortTitle: "Registration",
  },
  {
    id: "center-setup",
    title: "Center Setup & Administration",
    shortTitle: "Centers",
  },
  {
    id: "costs-manuals",
    title: "Program Costs & Manuals",
    shortTitle: "Costs & Manuals",
  },
  {
    id: "exams-grading",
    title: "Examinations, Grading & Academic Standards",
    shortTitle: "Exams & Grading",
  },
  {
    id: "graduation",
    title: "Graduation & Graduation Ceremonies",
    shortTitle: "Graduation",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  // 1. Overview & General Policy
  {
    id: "overview-what-is-sod",
    categoryId: "overview",
    question: "What is the School of Disciples (SOD)?",
    paragraphs: [
      "SOD is an impartation training program established on January 25, 1985, by General Overseer Pastor E.A. Adeboye and Pastor Folu Adeboye to train workers and ministers to become effective disciples and deploy them to parishes worldwide.",
    ],
  },
  {
    id: "overview-eligibility",
    categoryId: "overview",
    question: "What are the eligibility requirements to enroll in SOD?",
    paragraphs: [
      "Students must be born-again. Non-RCCG members are eligible if they are born-again and recommended by their respective pastors.",
    ],
  },
  {
    id: "overview-duration",
    categoryId: "overview",
    question: "What is the standard duration of the SOD academic year?",
    paragraphs: [
      "The academic year runs for 10 months, from July 1st to April 30th of the following year.",
    ],
  },
  // TODO: Restore "Are online classes permitted..." FAQ once the incomplete answer in SOD FAQ Update.docx is confirmed.

  // 2. Student & Center Registration Process
  {
    id: "registration-new-center",
    categoryId: "registration",
    question:
      "We want to start a new SOD center for our church. How do we begin?",
    paragraphs: [
      "First, talk to the pastor in charge of your church's zone to connect you with the SOD zonal coordinator for your zone. Then the SOD zonal/provincial/regional coordinator should write an email of intent to the SOD directorate informing us of your intention to begin a new center.",
      "The email should include the name of the new SOD center coordinator and the assistant coordinator, and their contact information (including email and phone number), and complete the Centers Registration Form to register this new center on the website.",
    ],
    links: [
      {
        label: "Centers Registration Form",
        href: "https://forms.office.com/r/4xdqXKPx7u",
        external: true,
      },
    ],
  },
  {
    id: "registration-student",
    categoryId: "registration",
    question: "How do I register as a student for the SOD program?",
    paragraphs: [
      "Go to your local RCCGNA parish or visit www.rccgnasod.org to locate the nearest parish/training center. You can also send an email to info@rccgnasod.org.",
    ],
    links: [
      {
        label: "Visit www.rccgnasod.org",
        href: "https://www.rccgnasod.org",
        external: true,
      },
      {
        label: "Email info@rccgnasod.org",
        href: "mailto:info@rccgnasod.org",
      },
    ],
  },
  {
    id: "registration-number",
    categoryId: "registration",
    question: "How are Student Registration Numbers generated?",
    paragraphs: [
      "Only the RCCGNA SOD Central Office can generate registration numbers for students. The registration number is automatically generated once the student fully completes the registration form on the website.",
    ],
  },
  {
    id: "registration-deadline",
    categoryId: "registration",
    question:
      "What is the deadline for student registration and MFRG submission?",
    paragraphs: [
      "The deadline for student registration for the 2026/2027 academic year is 11:59 PM on September 30, 2026.",
    ],
  },
  {
    id: "registration-late-additions",
    categoryId: "registration",
    question:
      "Can new students join an SOD class after the session has started?",
    paragraphs: [
      "No late additions are permitted after a class has made significant progress (up to Year 3). Also, no new registrations will be accepted after the registration deadline of 11:59 PM on September 30, 2026.",
      "Students unable to keep up with the class pace must withdraw and re-enroll the following academic year.",
    ],
  },

  // 3. Center Setup & Administration
  {
    id: "center-minimum-students",
    categoryId: "center-setup",
    question: "How many students are required to open a new SOD center?",
    paragraphs: [
      "A minimum of 2 students is required for a center to take off, in line with Matthew 18:20.",
    ],
  },
  {
    id: "center-who-teaches",
    categoryId: "center-setup",
    question: "Who is allowed to teach SOD classes?",
    paragraphs: [
      "Only graduates of the RCCG School of Disciples are permitted to teach or serve as an assistant coordinator for a center.",
    ],
  },

  // 4. Program Costs & Manuals
  {
    id: "costs-registration-fee",
    categoryId: "costs-manuals",
    question: "How much is the non-refundable registration fee for SOD?",
    paragraphs: [
      "The one-time non-refundable registration fee is $20.00. Students are required to pay $20 (plus credit card processing fees) at the time of registration.",
    ],
  },
  {
    id: "costs-total-fee",
    categoryId: "costs-manuals",
    question: "What is the total fee for the SOD program?",
    paragraphs: [
      "The total fee for the SOD program is $345. This fee covers registration, class manuals, tuition, and graduation fees. Once a student pays the $20 registration fee at the time of registration, the student then makes the balance payment of $325 to their center coordinator. The coordinator then remits the payment of all students in their center to the RCCGNA1 SOD Directorate.",
    ],
  },
  {
    id: "costs-borrowed-manuals",
    categoryId: "costs-manuals",
    question:
      "Can a student use manuals borrowed from a previous student without paying for new ones?",
    paragraphs: [
      "No, every student must purchase their own manuals. The manual fee remains mandatory even if a student uses books from a previous student.",
    ],
  },
  {
    id: "costs-order-manuals",
    categoryId: "costs-manuals",
    question:
      "Can individual students order manuals directly from the Central Office?",
    paragraphs: [
      "No, orders for manuals are only accepted from Zonal SOD Coordinators (ZSCs), Assistant ZSCs, or Center Coordinators.",
    ],
  },

  // 5. Examinations, Grading & Academic Standards
  {
    id: "exams-scheduling",
    categoryId: "exams-grading",
    question: "How is an exam scheduled?",
    paragraphs: [
      "Exams are currently scheduled on Appointy using the scheduling link below.",
      "Please note that due to the school's cohort system, all students must take and pass an exam before the next exam can be scheduled. You can schedule an exam multiple times to accommodate your students'/center's schedule, though no two exams can be scheduled on the same day.",
    ],
    links: [
      {
        label: "Schedule an Exam on Appointy",
        href: "https://booking.appointy.com/rccgnasod",
        external: true,
      },
    ],
  },
  {
    id: "exams-grading-breakdown",
    categoryId: "exams-grading",
    question: "How is the total mark calculated for an SOD year?",
    paragraphs: [
      "Evaluation consists of online Exams (40 Marks), Attendance (20 Marks), Manual Labor (20 Marks), and Converts/Evangelism (20 Marks, mandatory for Year 10).",
    ],
  },
  {
    id: "exams-attendance",
    categoryId: "exams-grading",
    question:
      "What minimum attendance score is required to take an examination?",
    paragraphs: [
      "Students must score a minimum of 50% class attendance per year to be eligible to write that year's examination.",
    ],
  },
  {
    id: "exams-passing-score",
    categoryId: "exams-grading",
    question: "What score is required to pass an SOD exam?",
    paragraphs: ["A minimum score of 50% is required to pass any exam."],
  },
  {
    id: "exams-initial-failure",
    categoryId: "exams-grading",
    question: "What happens if a student fails an initial examination?",
    paragraphs: [
      "The student must take and pass a remedial exam with at least 50%.",
    ],
  },
  {
    id: "exams-numeric-scores",
    categoryId: "exams-grading",
    question: "Do students receive their numerical test scores after an exam?",
    paragraphs: [
      'No, exam points are no longer sent to students; they will only receive a message of "Pass" or "Fail".',
    ],
  },
  {
    id: "exams-both-failed",
    categoryId: "exams-grading",
    question:
      "What happens if a student fails both the initial exam and the remedial exam?",
    paragraphs: [
      "Failure of both exams may result in withdrawal from the current cohort, requiring the student to re-enroll the following academic year.",
    ],
  },
  {
    id: "exams-daily-limit",
    categoryId: "exams-grading",
    question: "How many exams can a center schedule in a single day?",
    paragraphs: [
      "Centers are limited to scheduling only one exam per day.",
    ],
  },
  {
    id: "exams-same-day-lectures",
    categoryId: "exams-grading",
    question:
      "Can examinations be written on the same day lectures are completed?",
    paragraphs: [
      "No, examinations cannot be taken on the same day that the related lectures are concluded.",
    ],
  },
  {
    id: "exams-sequential-order",
    categoryId: "exams-grading",
    question: "What order must examinations be taken in?",
    paragraphs: [
      "Exams must be scheduled sequentially in consecutive order: YR1, YR2, YR3, Theory 1, YR4, YR5, YR6, Theory 2, YR7, YR8, YR9, Theory 3, YR10.",
    ],
  },
  {
    id: "exams-anti-cheating",
    categoryId: "exams-grading",
    question:
      "What anti-cheating measures are enforced during online exams?",
    paragraphs: [
      "Online exams include browser monitoring to detect new window activity. Any unauthorized window activity or use of electronic devices during exams is considered cheating.",
    ],
  },

  // 6. Graduation & Graduation Ceremonies
  {
    id: "graduation-when-where",
    categoryId: "graduation",
    question: "When and where does the SOD graduation take place?",
    paragraphs: [
      "Graduation takes place during the Annual Convention of RCCGNA in Dallas/Redemption Camp, Texas, typically held in June. SOD graduation is usually held on Thursday along with the Bible college graduation and ordination.",
    ],
  },
  {
    id: "graduation-certificates",
    categoryId: "graduation",
    question:
      "Who is authorized to collect SOD graduation certificates at the convention?",
    paragraphs: [
      "Certificates are handed over exclusively to Zonal SOD Coordinators (or their designated representatives) who have received financial clearance, and they in turn hand them to Center Coordinators.",
    ],
  },
];
