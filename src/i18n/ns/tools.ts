// i18n namespace: tools
// Owner: F3 — the calculator, the comparison, Home and the masthead.
// Keys must exist in ar and en with identical key sets.
//
// Two families of copy live here and must never be merged:
//   tools.min.*   — the PUBLISHED floor to be allowed to apply (قرار 295/2026).
//   tools.elig.*  — which colleges a track and field actually open
//                   (جدول مجلس التعليم العالي، 2026/2027).
// The competitive minimum — the mark of the last admitted student — is a third
// thing, and it has not been published for 2026/2027. `tools.min.competitive`
// says so, and it is rendered next to every floor the app shows.

export const toolsAr = {
  // ── Masthead ──────────────────────────────────────────────────────────────
  'tools.masthead.independent': 'تطبيق إرشادي مستقلّ — لا يمثّل جهة حكوميّة',
  'tools.masthead.dataSource':
    'يعرض بيانات منشورة من وزارة التعليم العالي والبحث العلمي ودائرة الإحصاءات العامّة',

  // ── The student's study path ──────────────────────────────────────────────
  'tools.path.label': 'مسارك',
  'tools.path.unset': 'لم تحدّد مسارك بعد',
  'tools.path.setPrompt':
    'حدّد مسارك وحقلك ليعرض التطبيق الكليات التي يفتحها لك جدول مجلس التعليم العالي.',
  'tools.path.setCta': 'تحديد المسار من حسابي',
  'tools.path.sourceLine':
    'جدول الكليات المسموح بها — مجلس التعليم العالي، صفحة القرار بتاريخ 8 أيلول 2024، يسري اعتباراً من العام الجامعي 2026/2027.',
  'tools.path.legacyLine':
    'أنت على الخطة القديمة. جدول 2026/2027 يخصّ طلبة الخطة الجديدة، ولم نعثر على جدول رسميّ مكافئ لفروع الخطة القديمة، لذلك لا يعرض التطبيق تقديراً هنا.',
  'tools.path.changeNote':
    'الحقول الستّة في المسار الأكاديمي قيد التعديل إلى أربعة اعتباراً من 2026/2027 لجيل 2009، والجداول المعدّلة لم تُنشر بعد.',

  // ── Eligibility ───────────────────────────────────────────────────────────
  'tools.elig.eligible': 'متاح لحقلك',
  'tools.elig.technical': 'بكالوريوس تقني/تطبيقي',
  'tools.elig.blocked': 'ليس ضمن قائمة مسارك',
  'tools.elig.unpublished': 'لم يُنشر لمسارك',
  'tools.elig.within': 'ضمن',
  'tools.elig.officialName': 'المسمّى في جدول مجلس التعليم العالي',
  'tools.elig.degreeLabel': 'الدرجة التي يؤدّي إليها',
  'tools.elig.degree.bachelor': 'بكالوريوس أكاديمي',
  'tools.elig.degree.technical': 'بكالوريوس تقني/تطبيقي — درجة مختلفة عن البكالوريوس الأكاديمي',
  'tools.elig.trackCheckTitle': 'قبل الأرقام: ماذا يفتح لك مسارك؟',
  'tools.elig.trackBinding.title': 'القيد هنا مسارك، وليس معدّلك',
  'tools.elig.trackBinding.body':
    'معدّلك يتجاوز الحدّ الأدنى المنشور للالتحاق بهذا التخصّص، لكنّ جدول مجلس التعليم العالي لعام 2026/2027 لا يفتحه من مسارك الحالي. المسار يُختار في نهاية الصف التاسع، والمعدّل وحده لا يغيّره.',
  'tools.elig.alternativesTitle': 'تخصّصات يفتحها لك مسارك',
  'tools.elig.alternativesHint': 'اضغط أيّ تخصّص ليحلّ محلّ التخصّص المحجوب في الحساب.',
  'tools.elig.alternativesEmpty':
    'لا يوجد في قائمة التطبيق الحاليّة تخصّص بديل مرتبط بمسارك. اطّلع على قائمة الكليات كاملةً في جدول مجلس التعليم العالي.',
  'tools.elig.exploreNote':
    'التخصّص يبقى معروضاً وقابلاً للحساب — الاستكشاف حقّك، والمعلومة الرسميّة معروضة إلى جانبه.',

  // ── Published admission floors ────────────────────────────────────────────
  'tools.min.notCompetitiveShort': 'ليس الحدّ التنافسي',
  'tools.min.title': 'الحدّ الأدنى المنشور للالتحاق',
  'tools.min.public': 'الجامعات الرسميّة',
  'tools.min.private': 'الجامعات الخاصّة',
  'tools.min.yours': 'معدّلك',
  'tools.min.meets': 'يستوفي الحدّ الأدنى للتقديم',
  'tools.min.short': 'أقلّ من الحدّ الأدنى للتقديم',
  'tools.min.tier': 'الفئة في القرار',
  'tools.min.competitive':
    'هذا حدّ أدنى للتقديم، وليس توقّعاً للقبول. الحدّ الأدنى التنافسي لعام 2026/2027 — أي علامة آخر طالب مقبول — لم تنشره وحدة تنسيق القبول الموحّد بعد، وهو عادةً أعلى من هذا الرقم.',
  'tools.min.historical': 'الحدود الدنيا التنافسيّة للأعوام السابقة منشورة على موقع وحدة تنسيق القبول الموحّد',
  'tools.min.source': 'قرار مجلس التعليم العالي رقم (295/2026) تاريخ 25/6/2026 — السياسة العامّة للقبول 2026/2027',
  'tools.min.subjectFloor':
    'يُشترط إضافةً إلى المعدّل ألّا تقلّ علامة الطالب في أيّ مادة عن 50% من الحدّ الأعلى لعلامة تلك المادة.',
  'tools.min.none': 'لا يرد حدّ أدنى منشور لهذا التخصّص في القرار.',
  'tools.min.needGrade': 'أدخل معدّلك لمقارنته بالحدّ الأدنى المنشور.',

  // ── Calculator ────────────────────────────────────────────────────────────
  'tools.calc.gpa.invalid': 'أدخل معدّلاً بين 60 و100 لمتابعة الحساب.',
  'tools.calc.gpa.fromProfile': 'مأخوذ من حسابك — عدّله هنا إن أردت',
  'tools.calc.gpa.decrease': 'إنقاص المعدّل',
  'tools.calc.gpa.increase': 'زيادة المعدّل',
  'tools.calc.budget.decrease': 'إنقاص الميزانيّة',
  'tools.calc.budget.increase': 'زيادة الميزانيّة',
  'tools.calc.budget.annual': 'الكلفة السنويّة التقديريّة',
  'tools.calc.budget.overShort': 'فوق الميزانيّة',
  'tools.calc.budget.over': 'تتجاوز ميزانيّتك السنويّة بـ',
  'tools.calc.budget.within': 'ضمن ميزانيّتك السنويّة',
  'tools.calc.budget.overTitle': 'تخصّصات فوق الميزانيّة التي حدّدتها',
  'tools.calc.budget.note':
    'الكلفة السنويّة = الرسوم السنويّة + النقل + 1,500 د.أ إقامة وكتب. تُقارن بالميزانيّة السنويّة التي أدخلتها في الخطوة الأولى.',
  'tools.calc.eligibleIndicative': 'فوق المعدّل الاسترشادي',
  'tools.calc.methodBody':
    'العائد = الدخل المتوقّع لعشر سنوات (مرجّح بنسبة التوظيف المفترضة للتخصّص) − إجمالي كلفة الدراسة (الرسوم + النقل + الإقامة + الكتب).',
  'tools.calc.reportTitle': 'تقرير حاسبة عائد التعليم',

  // ── Compare ───────────────────────────────────────────────────────────────
  'tools.compare.title': 'مقارنة التخصّصات',
  'tools.compare.subtitle': 'مقارنة تحليليّة لثلاثة تخصّصات',
  'tools.compare.selectedTitle': 'التخصّصات المحدّدة',
  'tools.compare.change': 'تغيير',
  'tools.compare.pickTitle': 'اختيار التخصّص',
  'tools.compare.allPicked': 'التخصّصات الأخرى محدّدة بالفعل في المقارنة.',
  'tools.compare.criterion': 'المعيار',
  'tools.compare.duration': 'مدّة الدراسة',
  'tools.compare.tuitionGov': 'الرسوم السنويّة (حكومي)',
  'tools.compare.tuitionPrivate': 'الرسوم السنويّة (خاصّ)',
  'tools.compare.firstSalary': 'الراتب الأوّل',
  'tools.compare.salary5': 'الراتب بعد 5 سنوات',
  'tools.compare.salary10': 'الراتب بعد 10 سنوات',
  'tools.compare.growth2030': 'نموّ الطلب 2030',
  'tools.compare.postings30': 'الإعلانات الحاليّة (30 يوماً)',
  'tools.compare.satisfaction': 'مؤشّر الرضا',
  'tools.compare.unemploymentShort': 'بطالة',
  'tools.compare.eligibilityRow': 'الإتاحة لمسارك',
  'tools.compare.minRowPublic': 'الحدّ الأدنى للالتحاق (رسمي)',
  'tools.compare.minRowPrivate': 'الحدّ الأدنى للالتحاق (خاصّ)',
  'tools.compare.radarTitle': 'تحليل متعدّد الأبعاد',
  'tools.compare.radarSubtitle': 'مقارنة على ستّة معايير أساسيّة (0–100)',
  'tools.compare.salaryTitle': 'منحنى تطوّر الراتب',
  'tools.compare.salarySubtitle': 'دينار أردني شهريّاً',
  'tools.compare.axis.salary': 'الراتب الأوّل',
  'tools.compare.axis.growth': 'النموّ المستقبلي',
  'tools.compare.axis.employment': 'فرص التوظيف',
  'tools.compare.axis.satisfaction': 'الرضا الوظيفي',
  'tools.compare.axis.speed': 'سرعة التخرّج',
  'tools.compare.axis.affordability': 'انخفاض الكلفة',
  'tools.compare.year1': 'السنة 1',
  'tools.compare.year5': 'السنة 5',
  'tools.compare.year10': 'السنة 10',

  // ── Home ──────────────────────────────────────────────────────────────────
  'tools.home.hook.eyebrow': 'مُرشِدي • من الحيرة إلى قرار',
  'tools.home.hook.titleA': 'تخصّص يناسب طموحك.',
  'tools.home.hook.titleB': 'وكلفة تناسب واقعك.',
  'tools.home.hook.body': 'قارن البرامج والرسوم، افهم شروط التقديم، وخذ قرارك على معلومة واضحة.',
  'tools.home.hook.cta': 'ابدأ مقارنة خياراتك',
  'tools.home.hook.assurance': 'المصدر والفترة ظاهران • افتراضاتك قابلة للتعديل',
  'tools.home.jobs.occupation': 'المهنة',
  'tools.home.jobs.postings': 'الإعلانات',
  'tools.home.jobs.change': 'التغيّر',
  'tools.home.field.title': 'حقلي وكلياتي',
  'tools.home.field.bachelorCount': 'الكليات التي يفتحها حقلك',
  'tools.home.field.diplomaCount': 'برامج الدبلوم المتوسّط',
  'tools.home.field.techCount': 'برامج البكالوريوس التقني/التطبيقي',
  'tools.home.field.cta': 'عرض حقلي وكلياتي',
  'tools.home.field.vocationalLine':
    'مسارك المهني يؤدّي إلى الدبلوم المتوسّط أو البكالوريوس التقني/التطبيقي — وهي درجة مختلفة عن البكالوريوس الأكاديمي.',
  'tools.home.field.empty': 'لا ترد كليات لهذا الحقل في الجدول المنشور.',
} as const;

export const toolsEn = {
  // ── Masthead ──────────────────────────────────────────────────────────────
  'tools.masthead.independent': 'Independent guidance app — not a government body',
  'tools.masthead.dataSource':
    'Shows data published by the Ministry of Higher Education and Scientific Research and the Department of Statistics',

  // ── The student's study path ──────────────────────────────────────────────
  'tools.path.label': 'Your track',
  'tools.path.unset': 'Your track is not set yet',
  'tools.path.setPrompt':
    'Set your track and field so the app can show which colleges the Higher Education Council table opens for you.',
  'tools.path.setCta': 'Set it in my profile',
  'tools.path.sourceLine':
    'Table of permitted colleges — Higher Education Council, decision page dated 8 Sep 2024, effective from the 2026/2027 academic year.',
  'tools.path.legacyLine':
    'You are on the previous plan. The 2026/2027 table covers new-plan students, and we found no equivalent official table for the previous plan’s branches, so the app shows no estimate here.',
  'tools.path.changeNote':
    'The six academic fields are being reduced to four from 2026/2027 for the 2009 cohort, and the amended tables have not been published.',

  // ── Eligibility ───────────────────────────────────────────────────────────
  'tools.elig.eligible': 'Open to your field',
  'tools.elig.technical': 'Technical/applied bachelor',
  'tools.elig.blocked': 'Not on your track’s list',
  'tools.elig.unpublished': 'Not published for your track',
  'tools.elig.within': 'within',
  'tools.elig.officialName': 'Name in the Higher Education Council table',
  'tools.elig.degreeLabel': 'Degree it leads to',
  'tools.elig.degree.bachelor': 'Academic bachelor',
  'tools.elig.degree.technical': 'Technical/applied bachelor — a different degree from the academic bachelor',
  'tools.elig.trackCheckTitle': 'Before the money: what does your track open?',
  'tools.elig.trackBinding.title': 'Your track is the constraint here — not your average',
  'tools.elig.trackBinding.body':
    'Your average clears the published floor to apply for this major, but the Higher Education Council table for 2026/2027 does not open it from your current track. The track is chosen at the end of grade 9, and an average alone does not change it.',
  'tools.elig.alternativesTitle': 'Majors your track does open',
  'tools.elig.alternativesHint': 'Tap any major to put it in the calculation in place of the blocked one.',
  'tools.elig.alternativesEmpty':
    'The app’s current list has no alternative major tied to your track. See the full college list in the Higher Education Council table.',
  'tools.elig.exploreNote':
    'The major stays visible and the calculation still runs — exploring is your right, and the official information sits next to it.',

  // ── Published admission floors ────────────────────────────────────────────
  'tools.min.notCompetitiveShort': 'Not the competitive cut-off',
  'tools.min.title': 'Published minimum to apply',
  'tools.min.public': 'Public universities',
  'tools.min.private': 'Private universities',
  'tools.min.yours': 'Your average',
  'tools.min.meets': 'Meets the floor to apply',
  'tools.min.short': 'Below the floor to apply',
  'tools.min.tier': 'Tier in the decision',
  'tools.min.competitive':
    'This is a floor to apply, not a prediction of admission. The competitive minimum for 2026/2027 — the mark of the last admitted student — has not been published by the Unified Admission Coordination Unit, and it is usually higher than this figure.',
  'tools.min.historical': 'Competitive minimums for previous years are published on the Unified Admission Coordination Unit website',
  'tools.min.source': 'Higher Education Council decision 295/2026 of 25 Jun 2026 — Bachelor admission policy 2026/2027',
  'tools.min.subjectFloor':
    'Alongside the average, no subject mark may fall below 50% of that subject’s maximum.',
  'tools.min.none': 'The decision lists no published floor for this major.',
  'tools.min.needGrade': 'Enter your average to compare it against the published floor.',

  // ── Calculator ────────────────────────────────────────────────────────────
  'tools.calc.gpa.invalid': 'Enter an average between 60 and 100 to continue.',
  'tools.calc.gpa.fromProfile': 'Taken from your account — change it here if you want',
  'tools.calc.gpa.decrease': 'Decrease the average',
  'tools.calc.gpa.increase': 'Increase the average',
  'tools.calc.budget.decrease': 'Decrease the budget',
  'tools.calc.budget.increase': 'Increase the budget',
  'tools.calc.budget.annual': 'Estimated annual cost',
  'tools.calc.budget.overShort': 'Over budget',
  'tools.calc.budget.over': 'Over your annual budget by',
  'tools.calc.budget.within': 'Within your annual budget',
  'tools.calc.budget.overTitle': 'Majors above the budget you set',
  'tools.calc.budget.note':
    'Annual cost = yearly tuition + transport + 1,500 JOD housing and books. It is compared against the annual budget you entered in step one.',
  'tools.calc.eligibleIndicative': 'Above the indicative average',
  'tools.calc.methodBody':
    'Net ROI = expected 10-year income (weighted by the assumed employment rate of the major) − total study cost (tuition + transport + housing + books).',
  'tools.calc.reportTitle': 'Education ROI calculator report',

  // ── Compare ───────────────────────────────────────────────────────────────
  'tools.compare.title': 'Compare majors',
  'tools.compare.subtitle': 'An analytical comparison of three majors',
  'tools.compare.selectedTitle': 'Selected majors',
  'tools.compare.change': 'Change',
  'tools.compare.pickTitle': 'Choose a major',
  'tools.compare.allPicked': 'The other majors are already in the comparison.',
  'tools.compare.criterion': 'Criterion',
  'tools.compare.duration': 'Study duration',
  'tools.compare.tuitionGov': 'Yearly tuition (public)',
  'tools.compare.tuitionPrivate': 'Yearly tuition (private)',
  'tools.compare.firstSalary': 'First salary',
  'tools.compare.salary5': 'Salary after 5 years',
  'tools.compare.salary10': 'Salary after 10 years',
  'tools.compare.growth2030': 'Demand growth 2030',
  'tools.compare.postings30': 'Current postings (30 days)',
  'tools.compare.satisfaction': 'Satisfaction index',
  'tools.compare.unemploymentShort': 'Unemployment',
  'tools.compare.eligibilityRow': 'Open to your track',
  'tools.compare.minRowPublic': 'Floor to apply (public)',
  'tools.compare.minRowPrivate': 'Floor to apply (private)',
  'tools.compare.radarTitle': 'Multi-dimensional analysis',
  'tools.compare.radarSubtitle': 'Six core criteria (0–100)',
  'tools.compare.salaryTitle': 'Salary progression',
  'tools.compare.salarySubtitle': 'Jordanian dinars per month',
  'tools.compare.axis.salary': 'First salary',
  'tools.compare.axis.growth': 'Future growth',
  'tools.compare.axis.employment': 'Employment odds',
  'tools.compare.axis.satisfaction': 'Job satisfaction',
  'tools.compare.axis.speed': 'Time to graduate',
  'tools.compare.axis.affordability': 'Affordability',
  'tools.compare.year1': 'Year 1',
  'tools.compare.year5': 'Year 5',
  'tools.compare.year10': 'Year 10',

  // ── Home ──────────────────────────────────────────────────────────────────
  'tools.home.hook.eyebrow': 'Murshidi • From confusion to decision',
  'tools.home.hook.titleA': 'A major that fits your ambition.',
  'tools.home.hook.titleB': 'A cost that fits your reality.',
  'tools.home.hook.body': 'Compare programmes and fees, understand admission requirements, and decide on clear information.',
  'tools.home.hook.cta': 'Start comparing your options',
  'tools.home.hook.assurance': 'Source & period shown • Your assumptions are adjustable',
  'tools.home.jobs.occupation': 'Occupation',
  'tools.home.jobs.postings': 'Postings',
  'tools.home.jobs.change': 'Change',
  'tools.home.field.title': 'My field & colleges',
  'tools.home.field.bachelorCount': 'Colleges your field opens',
  'tools.home.field.diplomaCount': 'Intermediate diploma programmes',
  'tools.home.field.techCount': 'Technical/applied bachelor programmes',
  'tools.home.field.cta': 'Open my field & colleges',
  'tools.home.field.vocationalLine':
    'Your vocational track leads to the intermediate diploma or the technical/applied bachelor — a different degree from the academic bachelor.',
  'tools.home.field.empty': 'The published table lists no colleges for this field.',
} as const;
