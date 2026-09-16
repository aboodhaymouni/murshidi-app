// i18n namespace: data
// Owner: see docs/BUILD_SPEC.md. Add keys as `'data.someKey': '…'` in BOTH objects.
// Keys must exist in ar and en with identical key sets.
//
// This namespace covers the four data screens — Market, Future, Simulate and
// Alternatives — plus the shared honesty chrome (source labels, illustrative
// notes) that the round-one data pass introduced. Before this round those four
// pages hardcoded their titles, table headers and body copy in Arabic, so an
// English-reading juror got a half-translated app while the onboarding counted
// "2 languages" as a fact. Every literal they render now lives here.
//
// Every key here is prefixed `data.`, so nothing in this file collides with or
// silently overrides a key from core.ts. Two of them deliberately restate a
// core label with its honesty attached — `data.acceptance.label` and
// `data.unemployment.label` — and the screens call those rather than the bare
// core ones.

/** Fills `{placeholder}` slots in a translated string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export const dataAr = {
  // ── Shared chrome ─────────────────────────────────────────────────────────
  'data.sourceLabel': 'المصدر',
  'data.illustrative.short': 'مثال توضيحي',
  'data.dos.period': 'الربع الثاني 2026',
  'data.dos.periodPrev': 'الربع الثاني 2025',

  // ── Notes — one per data block, placed beside the numbers it covers ────────
  'data.note.acceptance':
    'معدّلات القبول المعروضة استرشاديّة للمقارنة، وليست الحدود الدنيا التنافسيّة لعام 2026/2027 — لم تُعلنها وحدة تنسيق القبول الموحّد بعد.',
  'data.note.majorFigures':
    'الرواتب ونسب البطالة وأعداد الإعلانات ونسب النموّ ومؤشّر الرضا لكلّ تخصّص أرقام توضيحيّة تُظهر آليّة الأداة، ولم تُستخرج من نشرة رسميّة.',
  'data.note.postings':
    'أعداد الإعلانات توضيحيّة تُظهر شكل المرصد، وليست حصراً فعليّاً من مواقع التوظيف.',
  'data.note.projections':
    'منحنيات التوقّع ونسب النموّ لعام 2030 توضيحيّة، ولا تمثّل تنبّؤاً منشوراً لأيّ جهة.',
  'data.note.stories':
    'تجارب مكتوبة لعرض شكل الشهادات في النسخة الكاملة — ليست شهادات خرّيجين حقيقيّين.',
  'data.note.scholarships':
    'القيم والمواعيد وشروط الأهليّة هنا توضيحيّة. تحقّق من الجهة المانحة قبل التقديم.',
  'data.note.simulation':
    'السيناريوهات تُبنى بمعاملات ثابتة على الراتب التوضيحي للتخصّص، وليست نموذجاً إحصائيّاً ولا تنبّؤاً.',
  'data.note.alternatives':
    'الكلف ورواتب البداية ونسب البطالة لهذه المسارات توضيحيّة — راجع الجهة المقدّمة للبرنامج.',
  'data.note.impact':
    'المنصّة في مرحلة العرض، وهذه الأرقام توضيحيّة لشكل لوحة الأثر ولا تمثّل استخداماً فعليّاً.',
  'data.note.roi':
    'الحساب يستخدم الأرقام التوضيحيّة للتخصّص، والمعادلة معروضة كاملةً ليتمكّن أيّ قارئ من مراجعتها.',

  // Labels that carry their own honesty
  'data.acceptance.label': 'معدّل القبول (استرشادي)',
  'data.unemployment.label': 'نسبة البطالة (توضيحيّة)',

  // ── Home ──────────────────────────────────────────────────────────────────
  'data.home.officialTitle': 'مؤشّر رسمي منشور',
  'data.home.impactTitle': 'أثر المنصّة — أرقام توضيحيّة',
  'data.home.dosTotal': 'إجمالي السكّان',
  'data.home.dosJordanians': 'الأردنيّون',
  'data.home.dosVsLastYear': 'مقابل',

  // ── Market ────────────────────────────────────────────────────────────────
  'data.market.title': 'مرصد سوق العمل الأردني',
  'data.market.subtitle': 'عرض توضيحي لشكل المرصد',
  'data.market.notice':
    'كلّ الأرقام في هذه الصفحة توضيحيّة. ربط المرصد بمصادر الإعلانات الفعليّة هو الخطوة التالية في خارطة الطريق.',
  'data.market.derived':
    'أرقام هذه الصفحة كلّها محسوبة من سلسلة شهريّة واحدة: الإجمالي ونسبة التغيّر والتوزيع حسب القطاع والتوزيع الجغرافي كلّها مشتقّة من الجدول نفسه، فلا يمكن لرقمين على الشاشة أن يتناقضا.',
  'data.market.referenceMonth': 'الشهر المرجعي',
  'data.market.kpi.postings': 'إعلانات المهن المتتبَّعة',
  'data.market.kpi.growth': 'التغيّر عن الشهر السابق',
  'data.market.kpi.growthSub': 'محسوب من السلسلة أدناه',
  'data.market.kpi.growing': 'مهن في نموّ',
  'data.market.kpi.growingSub': 'من أصل {total} مهنة متتبَّعة',
  'data.market.trendTitle': 'تطوّر الإعلانات حسب القطاع',
  'data.market.trendSub': 'الحدّ الأعلى للمساحات المتراكمة هو إجمالي الإعلانات الشهري',
  'data.market.topHiring': 'المهن الأكثر طلباً',
  'data.market.declining': 'المهن في تراجع',
  'data.market.topPaying': 'المهارات الأعلى أجراً',
  'data.market.sectorSplit': 'التوزيع حسب القطاع',
  'data.market.geoSplit': 'التوزيع الجغرافي',
  'data.market.geoNote': 'حصص من إجمالي الشهر المرجعي',
  'data.market.tableTotal': 'مجموع الجدولين يساوي إجمالي الشهر المرجعي',

  // Table headers shared across the data screens
  'data.col.rank': '#',
  'data.col.occupation': 'المهنة',
  'data.col.postings': 'عدد الإعلانات',
  'data.col.change': 'التغيّر',
  'data.col.skill': 'المهارة',
  'data.col.avgPay': 'متوسّط الأجر',

  // Sectors
  'data.sector.tech': 'تقنيّة',
  'data.sector.business': 'إدارة وأعمال',
  'data.sector.medical': 'صحّة',
  'data.sector.engineering': 'هندسة',
  'data.sector.other': 'قطاعات أخرى',

  // Months of the observatory series
  'data.month.short.2026-05': 'أيّار',
  'data.month.short.2026-06': 'حزيران',
  'data.month.short.2026-07': 'تمّوز',
  'data.month.short.2026-08': 'آب',
  'data.month.long.2026-05': 'أيّار 2026',
  'data.month.long.2026-06': 'حزيران 2026',
  'data.month.long.2026-07': 'تمّوز 2026',
  'data.month.long.2026-08': 'آب 2026',

  // Governorates
  'data.gov.amman': 'عمّان',
  'data.gov.irbid': 'إربد',
  'data.gov.zarqa': 'الزرقاء',
  'data.gov.aqaba': 'العقبة',
  'data.gov.karak': 'الكرك',
  'data.gov.other': 'باقي المحافظات',

  // ── Future ────────────────────────────────────────────────────────────────
  'data.future.title': 'مستقبل الوظائف 2030–2035',
  'data.future.subtitle': 'تقرير منشور + أمثلة توضيحيّة',
  'data.future.wefTitle': 'المنتدى الاقتصادي العالمي — تقرير مستقبل الوظائف 2025',
  'data.future.wefBody':
    'يقدّر التقرير أنّ التغيّر الهيكلي سيطال 22% من الوظائف حتى عام 2030: استحداث 170 مليون وظيفة (14% من التشغيل الحالي) مقابل زوال 92 مليون وظيفة (8%)، بصافي نموّ 78 مليون وظيفة.',
  'data.future.wefCite': 'المنتدى الاقتصادي العالمي، تقرير مستقبل الوظائف 2025 (نُشر 8 كانون الثاني 2025)',
  'data.future.caution':
    'الأرقام في الجداول والمنحنيات في هذه الصفحة توضيحيّة لعرض شكل التحليل. الرقم الوحيد المنسوب إلى مصدر منشور هنا هو عنوان تقرير مستقبل الوظائف 2025 أعلاه.',
  'data.future.cautionTitle': 'تنبيه',
  'data.future.chartTitle': 'منحنى توضيحي للطلب على الوظائف',
  'data.future.chartSub': '2024 = 100 (مؤشّر أساس)',
  'data.future.line.ai': 'الذكاء الاصطناعي',
  'data.future.line.security': 'الأمن السيبراني',
  'data.future.line.design': 'تصميم تجربة المستخدم',
  'data.future.line.traditional': 'المحاسبة التقليديّة',
  'data.future.growing': 'المهن في نموّ مستمرّ',
  'data.future.declining': 'المهن في تراجع',
  'data.future.col.growth': 'نسبة النموّ',
  'data.future.col.decline': 'نسبة التراجع',
  'data.future.horizon': 'النسب في الجدولين أعلاه تشير إلى أفق عام {year}، وهي توضيحيّة لا تنبّؤ منشور.',
  'data.future.newJobs': 'أدوار مهنيّة حديثة الظهور',
  'data.future.newJobsSub': 'أمثلة توضيحيّة، لا حصر منشور',
  'data.future.col.sector': 'القطاع',
  'data.future.cat.ai': 'الذكاء الاصطناعي',
  'data.future.cat.env': 'البيئة والاستدامة',
  'data.future.cat.cyber': 'الأمن السيبراني',
  'data.future.job.prompt': 'مهندس أوامر الذكاء الاصطناعي',
  'data.future.job.aiEthics': 'مسؤول أخلاقيّات الذكاء الاصطناعي',
  'data.future.job.vrContent': 'صانع محتوى الواقع الافتراضي',
  'data.future.job.sustainability': 'مستشار الاستدامة',
  'data.future.job.climateRisk': 'محلّل المخاطر المناخيّة',
  'data.future.job.dpo': 'مسؤول حماية البيانات الشخصيّة',
  'data.future.job.robotics': 'مهندس روبوتيّات',
  'data.future.job.genomics': 'مستشار الجينوم',

  // ── Stories ───────────────────────────────────────────────────────────────
  'data.stories.subtitle': 'تجارب توضيحيّة لمسارات الخرّيجين',

  // ── Scholarships ──────────────────────────────────────────────────────────
  'data.scholarships.subtitle': 'أمثلة توضيحيّة لأنواع المنح المتاحة',
  'data.scholarships.verify': 'القيم والمواعيد النهائيّة تُعتمد من الجهة المانحة نفسها عبر منصّتها الرسميّة.',

  // ── Simulate ──────────────────────────────────────────────────────────────
  'data.simulate.intro':
    'تعرض المحاكاة ثلاثة مسارات لكلّ تخصّص (الأكثر احتمالاً، الأفضل، الأسوأ) بتطبيق معاملات ثابتة على الراتب التوضيحي للتخصّص.',
  'data.simulate.probabilityNote': 'أوزان المسارات الثلاثة توضيحيّة',
  'data.sim.title': 'محاكاة المسار المهني',
  'data.sim.pickSubtitle': 'اختر تخصّصاً لعرض السيناريوهات',
  'data.sim.pickTitle': 'اختيار التخصّص',
  'data.sim.titleFor': 'محاكاة: {major}',
  'data.sim.subtitle': 'ثلاثة مسارات توضيحيّة بعد التخرّج',
  'data.sim.reset': 'اختيار تخصّص آخر',
  'data.sim.scenario.likely': 'الأكثر احتمالاً',
  'data.sim.scenario.best': 'الأفضل',
  'data.sim.scenario.worst': 'الأسوأ',
  'data.sim.weight': 'وزن توضيحي {percent}%',
  'data.sim.basis': 'أساس أرقام هذا المسار: الراتب الأوّل التوضيحي للتخصّص ({salary}) مضروباً في معامل ثابت قدره {factor}.',
  'data.sim.timeline': 'جدول الأحداث الزمني',
  'data.sim.col.year': 'السنة',
  'data.sim.col.event': 'الحدث',
  'data.sim.verdictTitle': 'خلاصة المحاكاة',
  'data.sim.verdict.best':
    'هذا المسار يمنح خرّيج {major} استقلالاً مالياً مبكّراً وفرصاً قويّة، لكنّه يحمل في هذه الأداة وزناً توضيحيّاً قدره {percent}% فقط.',
  'data.sim.verdict.worst':
    'حتى في المسار الأسوأ يبقى تخصّص {major} قابلاً للتسويق. خصّص جزءاً من وقتك لمهارات إضافيّة تقصّر المسافة إلى الوظيفة الأولى.',
  'data.sim.verdict.likely':
    'المسار الأقرب إلى الواقع لتخصّص {major}. الالتزام والمهارات الإضافيّة هما عاملا الفرق بين هذا المسار والمسار الأفضل.',

  // Simulation events — every line is illustrative, none of it is a forecast
  'data.sim.ev.start.title': 'بدء الدراسة الجامعيّة',
  'data.sim.ev.start.desc': 'القبول في تخصّص {major}. تبدأ السنة الأولى بالموادّ الأساسيّة.',
  'data.sim.ev.mid.best.title': 'تدريب صيفي مدفوع',
  'data.sim.ev.mid.best.desc':
    'فرصة تدريب مدفوع أثناء الدراسة تفتح باب الانتقال السلس إلى السوق بعد التخرّج.',
  'data.sim.ev.mid.worst.title': 'تأجيل سنة دراسيّة',
  'data.sim.ev.mid.worst.desc': 'بسبب الإخفاق في موادّ متطلّبة، يتأخّر التخرّج عاماً واحداً.',
  'data.sim.ev.mid.likely.title': 'منحة جزئيّة',
  'data.sim.ev.mid.likely.desc': 'منحة جزئيّة على المعدّل التراكمي تخفّف جزءاً من الرسوم.',
  'data.sim.ev.grad.title': 'التخرّج',
  'data.sim.ev.grad.desc': 'معدّل التخرّج في هذا المسار: {gpa} من 4 ({label}).',
  'data.sim.ev.firstJob.title': 'الوظيفة الأولى',
  'data.sim.ev.firstJob.desc': 'بعد {wait} من التخرّج، وظيفة في {employer} براتب {salary}.',
  'data.sim.ev.wait.best': 'شهر واحد',
  'data.sim.ev.wait.worst': 'أربعة عشر شهراً',
  'data.sim.ev.wait.likely': 'أربعة أشهر',
  'data.sim.ev.employer.tech': 'شركة برمجيّات',
  'data.sim.ev.employer.medical': 'مستشفى خاصّ',
  'data.sim.ev.employer.other': 'شركة متوسّطة الحجم',
  'data.sim.ev.step.best.title': 'ترقية إلى مستوى أعلى',
  'data.sim.ev.step.best.desc': 'الترقية إلى مستوى خبير براتب {salary}.',
  'data.sim.ev.step.worst.title': 'تغيير جهة العمل',
  'data.sim.ev.step.worst.desc': 'الانتقال إلى شركة جديدة براتب {salary}.',
  'data.sim.ev.step.likely.title': 'الترقية الطبيعيّة',
  'data.sim.ev.step.likely.desc': 'الترقية إلى مستوى متوسّط الخبرة براتب {salary}.',
  'data.sim.ev.settle.best.title': 'فرصة عمل خارج الأردن',
  'data.sim.ev.settle.best.desc':
    'عرض عمل عن بُعد أو خارج الأردن براتب يفوق مستوى السوق المحلّي لهذا التخصّص.',
  'data.sim.ev.settle.other.title': 'استقرار مهني',
  'data.sim.ev.settle.other.desc': 'مرحلة استقرار مهني وشخصي، والتخطيط لالتزامات طويلة الأمد.',
  'data.sim.ev.decade.title': 'بعد عشر سنوات من التخرّج',
  'data.sim.ev.decade.desc': 'الراتب في هذا المسار: {salary} شهريّاً. {tail}',
  'data.sim.ev.decade.tail.best': 'مستوى مرتفع من الاستقلال المالي.',
  'data.sim.ev.decade.tail.worst': 'استقرار متوسّط؛ تطوير المهارات هو ما يحرّك هذا الرقم.',
  'data.sim.ev.decade.tail.likely': 'استقرار ونموّ طبيعي.',

  // ── Alternatives ──────────────────────────────────────────────────────────
  'data.alternatives.message':
    'الجامعة ليست المسار الوحيد. الدبلوم أو الشهادة المهنيّة قد تكون أقصر وأقلّ كلفة وأقرب إلى حاجة السوق من بكالوريوس لا يخدم صاحبه.',
  'data.alternatives.context': 'البطالة بين الأردنيّين',
  'data.alt.title': 'المسارات البديلة',
  'data.alt.subtitle': 'ليست الجامعة الطريق الوحيد',
  'data.alt.messageTitle': 'رسالة مهمّة',
  'data.alt.quickCompare': 'مقارنة سريعة',
  'data.alt.available': 'المسارات المتاحة',
  'data.alt.col.track': 'المسار',
  'data.alt.col.duration': 'المدّة',
  'data.alt.col.cost': 'الكلفة',
  'data.alt.row.duration': 'المدّة الزمنيّة',
  'data.alt.row.cost': 'الكلفة الإجماليّة',
  'data.alt.row.startSalary': 'راتب البداية',
  'data.alt.row.unemployment': 'نسبة البطالة في المجال',
  'data.alt.quick.bachelor': 'بكالوريوس جامعي تقليدي',
  'data.alt.quick.bachelorDur': '4–6 سنوات',
  'data.alt.quick.diploma': 'دبلوم متوسّط بعد الثانويّة',
  'data.alt.quick.diplomaDur': 'سنتان',
  'data.alt.quick.certs': 'شهادات تخصّصيّة قصيرة',
  'data.alt.quick.certsDur': '6–9 أشهر',
  'data.alt.type.diploma': 'دبلوم',
  'data.alt.type.certificate': 'شهادة',
  'data.alt.type.bootcamp': 'تدريب مكثّف',
  'data.alt.dur.twoYears': 'سنتان',
  'data.alt.dur.threeYears': 'ثلاث سنوات',
  'data.alt.dur.sixMonths': 'ستّة أشهر',
  'data.alt.dur.nineMonths': 'تسعة أشهر',
  'data.alt.dur.fourToSixMonths': '4–6 أشهر',
  'data.alt.item.interior.name': 'دبلوم التصميم الداخلي',
  'data.alt.item.interior.desc':
    'بديل عملي للهندسة المعماريّة. الدخول إلى السوق أسرع، والكلفة أقلّ من البكالوريوس.',
  'data.alt.item.cad.name': 'شهادات الرسم والنمذجة الهندسيّة (AutoCAD · Revit · 3D)',
  'data.alt.item.cad.desc': 'مسار قصير سريع الدخل لمن يهتمّ بالتصميم الإنشائي والمعماري.',
  'data.alt.item.fullstack.name': 'تدريب مكثّف في تطوير الويب المتكامل',
  'data.alt.item.fullstack.desc':
    'بديل قوي لعلوم الحاسوب عبر منصّات تدريب معتمدة. الأهمّ هو بناء ملفّ أعمال فعلي، لا الشهادة وحدها.',
  'data.alt.item.cyber.name': 'دبلوم متوسّط في الأمن السيبراني',
  'data.alt.item.cyber.desc':
    'مسار مهني قصير في مجال يتوسّع محلّيّاً. تحقّق من اعتماد البرنامج لدى الجهة المقدّمة قبل التسجيل.',
  'data.alt.item.nursing.name': 'دبلوم التمريض',
  'data.alt.item.nursing.desc': 'فرص عمل واسعة داخل الأردن وخارجه، وأقصر بسنة من البكالوريوس.',
  'data.alt.item.career.name': 'شهادات مهنيّة من مزوّدي تقنية عالميّين',
  'data.alt.item.career.desc':
    'مجالات مثل تحليل البيانات وإدارة المشاريع وتجربة المستخدم. كلفتها منخفضة ومسارها ذاتي التعلّم.',
} as const;

export const dataEn = {
  // ── Shared chrome ─────────────────────────────────────────────────────────
  'data.sourceLabel': 'Source',
  'data.illustrative.short': 'Illustrative',
  'data.dos.period': 'Q2 2026',
  'data.dos.periodPrev': 'Q2 2025',

  // ── Notes — one per data block, placed beside the numbers it covers ────────
  'data.note.acceptance':
    'The acceptance averages shown are indicative, for comparison. They are not the 2026/2027 competitive minimums, which the Unified Admission Coordination Unit has not yet announced.',
  'data.note.majorFigures':
    'Per-major salaries, unemployment rates, posting counts, growth rates and satisfaction scores are illustrative figures that show how the tool works. They are not taken from an official release.',
  'data.note.postings':
    'Posting counts are illustrative and show the shape of the observatory. They are not an actual count from job boards.',
  'data.note.projections':
    'Projection curves and 2030 growth rates are illustrative. They do not represent a published forecast by any body.',
  'data.note.stories':
    'Written to show how testimonials will appear in the full version — these are not real graduates.',
  'data.note.scholarships':
    'Amounts, deadlines and eligibility rules here are illustrative. Check with the granting body before applying.',
  'data.note.simulation':
    'Scenarios are built by applying fixed multipliers to the illustrative salary of the major. This is not a statistical model and not a forecast.',
  'data.note.alternatives':
    'Costs, starting salaries and unemployment rates for these tracks are illustrative — check with the training provider.',
  'data.note.impact':
    'The platform is at demo stage. These figures illustrate the impact panel and do not represent actual usage.',
  'data.note.roi':
    'The calculation uses the illustrative figures of each major, and the full formula is shown so any reader can check it.',

  // Labels that carry their own honesty
  'data.acceptance.label': 'Acceptance average (indicative)',
  'data.unemployment.label': 'Unemployment rate (illustrative)',

  // ── Home ──────────────────────────────────────────────────────────────────
  'data.home.officialTitle': 'Published official indicator',
  'data.home.impactTitle': 'Platform impact — illustrative figures',
  'data.home.dosTotal': 'Total population',
  'data.home.dosJordanians': 'Jordanians',
  'data.home.dosVsLastYear': 'vs',

  // ── Market ────────────────────────────────────────────────────────────────
  'data.market.title': 'Jordan Job Market Observatory',
  'data.market.subtitle': 'A demonstration of how the observatory looks',
  'data.market.notice':
    'Every figure on this page is illustrative. Connecting the observatory to live posting sources is the next step on the roadmap.',
  'data.market.derived':
    'Every figure on this page is computed from one monthly series: the total, the month-over-month change, the sector split and the governorate split are all derived from the same table, so no two numbers on this screen can contradict each other.',
  'data.market.referenceMonth': 'Reference month',
  'data.market.kpi.postings': 'Postings, tracked occupations',
  'data.market.kpi.growth': 'Change vs previous month',
  'data.market.kpi.growthSub': 'Computed from the series below',
  'data.market.kpi.growing': 'Occupations growing',
  'data.market.kpi.growingSub': 'of {total} tracked occupations',
  'data.market.trendTitle': 'Postings by sector, month by month',
  'data.market.trendSub': 'The top edge of the stacked areas is the monthly total',
  'data.market.topHiring': 'Occupations hiring most',
  'data.market.declining': 'Occupations in decline',
  'data.market.topPaying': 'Highest-paying skills',
  'data.market.sectorSplit': 'Share by sector',
  'data.market.geoSplit': 'Share by governorate',
  'data.market.geoNote': 'Shares of the reference-month total',
  'data.market.tableTotal': 'The two tables together equal the reference-month total',

  // Table headers shared across the data screens
  'data.col.rank': '#',
  'data.col.occupation': 'Occupation',
  'data.col.postings': 'Postings',
  'data.col.change': 'Change',
  'data.col.skill': 'Skill',
  'data.col.avgPay': 'Average pay',

  // Sectors
  'data.sector.tech': 'Technology',
  'data.sector.business': 'Business & admin',
  'data.sector.medical': 'Health',
  'data.sector.engineering': 'Engineering',
  'data.sector.other': 'Other sectors',

  // Months of the observatory series
  'data.month.short.2026-05': 'May',
  'data.month.short.2026-06': 'Jun',
  'data.month.short.2026-07': 'Jul',
  'data.month.short.2026-08': 'Aug',
  'data.month.long.2026-05': 'May 2026',
  'data.month.long.2026-06': 'June 2026',
  'data.month.long.2026-07': 'July 2026',
  'data.month.long.2026-08': 'August 2026',

  // Governorates
  'data.gov.amman': 'Amman',
  'data.gov.irbid': 'Irbid',
  'data.gov.zarqa': 'Zarqa',
  'data.gov.aqaba': 'Aqaba',
  'data.gov.karak': 'Karak',
  'data.gov.other': 'Other governorates',

  // ── Future ────────────────────────────────────────────────────────────────
  'data.future.title': 'The Future of Jobs 2030–2035',
  'data.future.subtitle': 'One published report + illustrative examples',
  'data.future.wefTitle': 'World Economic Forum — Future of Jobs Report 2025',
  'data.future.wefBody':
    'The report estimates that structural change will affect 22% of jobs by 2030: 170 million jobs created (14% of current employment) against 92 million displaced (8%), a net gain of 78 million jobs.',
  'data.future.wefCite': 'World Economic Forum, Future of Jobs Report 2025 (published 8 Jan 2025)',
  'data.future.caution':
    'The figures in the tables and curves on this page are illustrative and show the shape of the analysis. The only figure here attributed to a published source is the Future of Jobs Report 2025 headline above.',
  'data.future.cautionTitle': 'Caution',
  'data.future.chartTitle': 'An illustrative demand curve for jobs',
  'data.future.chartSub': '2024 = 100 (base index)',
  'data.future.line.ai': 'Artificial intelligence',
  'data.future.line.security': 'Cybersecurity',
  'data.future.line.design': 'User-experience design',
  'data.future.line.traditional': 'Traditional accounting',
  'data.future.growing': 'Occupations still growing',
  'data.future.declining': 'Occupations in decline',
  'data.future.col.growth': 'Growth',
  'data.future.col.decline': 'Decline',
  'data.future.horizon': 'The percentages in both tables above look to the year {year}. They are illustrative, not a published forecast.',
  'data.future.newJobs': 'Recently emerging roles',
  'data.future.newJobsSub': 'Illustrative examples, not a published inventory',
  'data.future.col.sector': 'Sector',
  'data.future.cat.ai': 'Artificial intelligence',
  'data.future.cat.env': 'Environment & sustainability',
  'data.future.cat.cyber': 'Cybersecurity',
  'data.future.job.prompt': 'Prompt Engineer',
  'data.future.job.aiEthics': 'AI Ethics Officer',
  'data.future.job.vrContent': 'VR Content Creator',
  'data.future.job.sustainability': 'Sustainability Consultant',
  'data.future.job.climateRisk': 'Climate Risk Analyst',
  'data.future.job.dpo': 'Data Protection Officer',
  'data.future.job.robotics': 'Robotics Engineer',
  'data.future.job.genomics': 'Genomics Counsellor',

  // ── Stories ───────────────────────────────────────────────────────────────
  'data.stories.subtitle': 'Illustrative graduate journeys',

  // ── Scholarships ──────────────────────────────────────────────────────────
  'data.scholarships.subtitle': 'Illustrative examples of the kinds of scholarship available',
  'data.scholarships.verify': 'Amounts and final deadlines are set by the granting body on its own official platform.',

  // ── Simulate ──────────────────────────────────────────────────────────────
  'data.simulate.intro':
    'The simulation shows three paths for each major (most likely, best, worst) by applying fixed multipliers to the illustrative salary of that major.',
  'data.simulate.probabilityNote': 'The weights of the three paths are illustrative',
  'data.sim.title': 'Career Path Simulation',
  'data.sim.pickSubtitle': 'Pick a major to see its scenarios',
  'data.sim.pickTitle': 'Choose a major',
  'data.sim.titleFor': 'Simulation: {major}',
  'data.sim.subtitle': 'Three illustrative paths after graduation',
  'data.sim.reset': 'Pick another major',
  'data.sim.scenario.likely': 'Most likely',
  'data.sim.scenario.best': 'Best case',
  'data.sim.scenario.worst': 'Worst case',
  'data.sim.weight': 'Illustrative weight {percent}%',
  'data.sim.basis': 'The figures on this path start from the major’s illustrative first salary ({salary}) multiplied by a fixed factor of {factor}.',
  'data.sim.timeline': 'Timeline of events',
  'data.sim.col.year': 'Year',
  'data.sim.col.event': 'Event',
  'data.sim.verdictTitle': 'What this scenario says',
  'data.sim.verdict.best':
    'This path gives a {major} graduate early financial independence and strong openings, but it carries an illustrative weight of only {percent}% in this tool.',
  'data.sim.verdict.worst':
    'Even on the worst path, a {major} degree stays marketable. Spend part of your time on additional skills that shorten the distance to a first job.',
  'data.sim.verdict.likely':
    'The path closest to reality for {major}. Commitment and extra skills are what separate this path from the best one.',

  // Simulation events — every line is illustrative, none of it is a forecast
  'data.sim.ev.start.title': 'University starts',
  'data.sim.ev.start.desc': 'Admission to {major}. The first year begins with foundation courses.',
  'data.sim.ev.mid.best.title': 'Paid summer placement',
  'data.sim.ev.mid.best.desc':
    'A paid placement during the degree opens a smooth route into the market after graduation.',
  'data.sim.ev.mid.worst.title': 'A year repeated',
  'data.sim.ev.mid.worst.desc': 'Failing prerequisite courses pushes graduation back by one year.',
  'data.sim.ev.mid.likely.title': 'Partial grant',
  'data.sim.ev.mid.likely.desc': 'A partial grant on cumulative average takes some of the fees off.',
  'data.sim.ev.grad.title': 'Graduation',
  'data.sim.ev.grad.desc': 'Graduating average on this path: {gpa} out of 4 ({label}).',
  'data.sim.ev.firstJob.title': 'First job',
  'data.sim.ev.firstJob.desc': '{wait} after graduating, a job at {employer} paying {salary}.',
  'data.sim.ev.wait.best': 'One month',
  'data.sim.ev.wait.worst': 'Fourteen months',
  'data.sim.ev.wait.likely': 'Four months',
  'data.sim.ev.employer.tech': 'a software company',
  'data.sim.ev.employer.medical': 'a private hospital',
  'data.sim.ev.employer.other': 'a mid-sized company',
  'data.sim.ev.step.best.title': 'Promotion to a senior role',
  'data.sim.ev.step.best.desc': 'Promotion to a senior level paying {salary}.',
  'data.sim.ev.step.worst.title': 'Changing employer',
  'data.sim.ev.step.worst.desc': 'Moving to a new company paying {salary}.',
  'data.sim.ev.step.likely.title': 'The ordinary promotion',
  'data.sim.ev.step.likely.desc': 'Promotion to a mid-level role paying {salary}.',
  'data.sim.ev.settle.best.title': 'An opening outside Jordan',
  'data.sim.ev.settle.best.desc':
    'A remote or overseas offer paying above the local market level for this major.',
  'data.sim.ev.settle.other.title': 'Settling in',
  'data.sim.ev.settle.other.desc':
    'A period of professional and personal stability, and planning for long-term commitments.',
  'data.sim.ev.decade.title': 'Ten years after graduation',
  'data.sim.ev.decade.desc': 'Salary on this path: {salary} per month. {tail}',
  'data.sim.ev.decade.tail.best': 'A high level of financial independence.',
  'data.sim.ev.decade.tail.worst': 'Moderate stability; skills development is what moves this figure.',
  'data.sim.ev.decade.tail.likely': 'Stability and ordinary growth.',

  // ── Alternatives ──────────────────────────────────────────────────────────
  'data.alternatives.message':
    'University is not the only path. A diploma or a professional certificate can be shorter, cheaper and closer to what the market needs than a bachelor degree that does not serve its holder.',
  'data.alternatives.context': 'Unemployment among Jordanians',
  'data.alt.title': 'Alternative Paths',
  'data.alt.subtitle': 'University is not the only route',
  'data.alt.messageTitle': 'Worth reading',
  'data.alt.quickCompare': 'At a glance',
  'data.alt.available': 'Available tracks',
  'data.alt.col.track': 'Track',
  'data.alt.col.duration': 'Duration',
  'data.alt.col.cost': 'Cost',
  'data.alt.row.duration': 'Duration',
  'data.alt.row.cost': 'Total cost',
  'data.alt.row.startSalary': 'Starting salary',
  'data.alt.row.unemployment': 'Unemployment in the field',
  'data.alt.quick.bachelor': 'Conventional bachelor degree',
  'data.alt.quick.bachelorDur': '4–6 years',
  'data.alt.quick.diploma': 'Post-secondary intermediate diploma',
  'data.alt.quick.diplomaDur': '2 years',
  'data.alt.quick.certs': 'Short specialist certificates',
  'data.alt.quick.certsDur': '6–9 months',
  'data.alt.type.diploma': 'Diploma',
  'data.alt.type.certificate': 'Certificate',
  'data.alt.type.bootcamp': 'Bootcamp',
  'data.alt.dur.twoYears': '2 years',
  'data.alt.dur.threeYears': '3 years',
  'data.alt.dur.sixMonths': '6 months',
  'data.alt.dur.nineMonths': '9 months',
  'data.alt.dur.fourToSixMonths': '4–6 months',
  'data.alt.item.interior.name': 'Interior Design Diploma',
  'data.alt.item.interior.desc':
    'A practical alternative to architecture. Faster to enter the market, and cheaper than a bachelor degree.',
  'data.alt.item.cad.name': 'Technical drawing & modelling certificates (AutoCAD · Revit · 3D)',
  'data.alt.item.cad.desc': 'A short, fast-earning route for anyone drawn to structural and architectural design.',
  'data.alt.item.fullstack.name': 'Full-stack web development bootcamp',
  'data.alt.item.fullstack.desc':
    'A strong alternative to a computer science degree through accredited training providers. Building a real portfolio matters more than the certificate itself.',
  'data.alt.item.cyber.name': 'Intermediate diploma in cybersecurity',
  'data.alt.item.cyber.desc':
    'A short vocational route into a field that is expanding locally. Check the programme’s accreditation with the provider before enrolling.',
  'data.alt.item.nursing.name': 'Nursing Diploma',
  'data.alt.item.nursing.desc': 'Wide employment openings inside Jordan and abroad, and a year shorter than the bachelor degree.',
  'data.alt.item.career.name': 'Professional certificates from global technology providers',
  'data.alt.item.career.desc':
    'Fields such as data analysis, project management and user experience. Low cost, and self-paced.',
} as const;
