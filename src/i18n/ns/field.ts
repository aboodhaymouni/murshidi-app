// i18n namespace: field — the «حقلي وكلياتي» screen at /field.
// Owner: F4 (see docs/FIX_SPEC.md §2). Keys must exist in ar and en alike.
//
// What is NOT in this file, on purpose:
//  • The names of the tracks, the six academic fields, the ten vocational
//    programmes, the legacy branches and every college in their lists. Those
//    are the Ministry's own wording and live in src/lib/tawjihi.data.ts,
//    generated from docs/tawjihi-2026-official.json. Copying them here would
//    create a second copy that could drift from the published table.
//  • The published admission floors and the subject-floor rule. Same reason:
//    they come from ADMISSION_MINIMUMS with their own citation.
//
// The copy below is the *framing* around those facts, and it is deliberately
// cautious in three places:
//  1. The diploma list and the technical-bachelor list are labelled as two
//     different degrees, because they are.
//  2. Every floor is named a floor to APPLY, never a prediction, and the screen
//     states that the 2026/2027 competitive minimums are not published.
//  3. The six academic fields are presented as today's published table, not as
//     a permanent structure.

export const fieldAr = {
  'field.nav': 'حقلي',
  'field.title': 'حقلي وكلياتي',
  'field.subtitle': 'الكليات التي يفتحها مسارك، كما نشرها مجلس التعليم العالي',

  // ── The source card ───────────────────────────────────────────────────────
  'field.source.title': 'مصدر هذه القوائم',
  'field.source.decision': 'قرار مجلس التعليم العالي — صفحة بتاريخ',
  'field.source.effective': 'يسري اعتباراً من العام الجامعي',
  'field.source.retrieved': 'تاريخ النقل عن المصدر',
  'field.source.pdfAcademic': 'ملفّ المسار الأكاديمي (PDF) — نسخة داخل التطبيق',
  'field.source.pdfVocational': 'ملفّ المسار المهني (PDF) — نسخة داخل التطبيق',
  'field.source.pdfAcademicLive': 'ملفّ المسار الأكاديمي على موقع الوزارة',
  'field.source.pdfVocationalLive': 'ملفّ المسار المهني على موقع الوزارة',
  'field.source.page': 'صفحة الخبر على موقع الوزارة',
  'field.source.localCopy': 'الملفّان الأوّلان محفوظان داخل التطبيق نفسه، فيمكن فتحهما ومطابقة القوائم عليهما بلا إنترنت. الرابطان التاليان يفتحان النسخة المنشورة على موقع الوزارة.',
  'field.source.verbatim': 'أسماء الكليات والتخصّصات معروضة بصياغة الوثيقة نفسها، من دون تحسين أو إضافة.',

  // ── Choosing / exploring a path ───────────────────────────────────────────
  'field.picker.title': 'اختر ما تريد استعراضه',
  'field.picker.hint': 'لسّا في الصفّ التاسع أو العاشر؟ بدّل الحقل أو البرنامج وشوف شو بيفتح كلّ خيار قبل ما تقرّر.',
  'field.picker.track': 'المسار',
  'field.picker.mine': 'هذا مسارك المسجّل',
  'field.picker.exploring': 'استعراض — هذا ليس مسارك المسجّل',
  'field.picker.backToMine': 'رجوع إلى مساري',
  'field.picker.noPath': 'ما حدّدت مسارك بعد',
  'field.picker.noPathBody': 'تقدر تستعرض أيّ حقل من هون. ولمّا تحدّد مسارك في ملفّك، بتفتح هذه الصفحة على مسارك مباشرة وبتصير باقي أدوات التطبيق تعرف كلياتك.',
  'field.picker.setPath': 'تحديد مساري',
  'field.picker.pickDetail': 'اختر حقلاً أو برنامجاً لعرض قوائمه.',

  // ── The college lists ─────────────────────────────────────────────────────
  'field.colleges.bachelor': 'الكليات والتخصّصات المسموح بها',
  'field.colleges.bachelorLead': 'يؤدّي إلى البكالوريوس الجامعي المعتاد.',
  'field.colleges.diploma': 'الدبلوم المتوسّط',
  'field.colleges.diplomaLead': 'تخصّصات الدبلوم المتوسّط المسموح بها لهذا البرنامج.',
  'field.colleges.technical': 'البكالوريوس التقني / التطبيقي',
  'field.colleges.technicalLead': 'تخصّصات البكالوريوس التقني/التطبيقي المسموح بها لهذا البرنامج.',
  'field.colleges.differentDegrees': 'القائمتان درجتان مختلفتان، لا مستويان من درجة واحدة: الدبلوم المتوسّط شهادة قائمة بذاتها، والبكالوريوس التقني/التطبيقي درجة بكالوريوس مختلفة عن البكالوريوس الأكاديمي. نعرضهما منفصلتين لهذا السبب.',
  // Arabic counts agree with the number: one, two, 3–10 take the broken plural,
  // 11 and above take the singular accusative. Four keys, not one.
  'field.colleges.oneItem': 'بند واحد في القائمة الرسميّة',
  'field.colleges.twoItems': 'بندان في القائمة الرسميّة',
  'field.colleges.fewItems': 'بنود في القائمة الرسميّة',
  'field.colleges.itemsLabel': 'بنداً في القائمة الرسميّة',
  'field.colleges.none': 'لا توجد بنود في هذه القائمة ضمن الوثيقة المنشورة.',
  'field.military': 'البنود المؤشّرة بنجمة تخصّ الكليات العسكريّة، بحسب هامش الوثيقة نفسها.',

  // ── Paths the published table does not answer for ─────────────────────────
  'field.legacy.title': 'الخطّة القديمة: لا جدول منشور',
  'field.legacy.body': 'جدول مجلس التعليم العالي يخصّ طلبة الخطّة الجديدة من 2026/2027. ما لقينا جدولاً رسميّاً مكافئاً لفروع ما قبل 2023، ولن نخمّن واحداً. طلبة الخطّة القديمة يتبعون تعليمات القبول المنشورة لسنتهم.',
  'field.legacy.explore': 'تقدر تستعرض من فوق أيّ حقل أو برنامج في الخطّة الجديدة لتشوف شو بيفتح.',

  // ── The app's own majors, partitioned by this path ────────────────────────
  'field.majors.title': 'تخصّصات هذا التطبيق على ضوء هذا المسار',
  'field.majors.lead': 'هذه تخصّصات موجودة داخل أدوات التطبيق فقط، مرتّبة حسب ما يفتحه المسار المعروض. القائمة الرسميّة الكاملة هي اللي فوق.',
  'field.majors.eligible': 'متاح — بكالوريوس',
  'field.majors.technical': 'متاح — بكالوريوس تقني/تطبيقي',
  'field.majors.blocked': 'غير متاح من هذا المسار',
  'field.majors.blockedLead': 'حسب جدول مجلس التعليم العالي، هذه التخصّصات لا تُفتح من المسار المعروض.',
  'field.majors.within': 'ضمن',
  'field.majors.withinHint': 'الوثيقة سمّت كليّة أوسع تشمل هذا التخصّص، ولم تسمّه بذاته.',
  'field.majors.none': 'ما في تخصّصات من هذه الفئة لهذا المسار.',
  'field.majors.save': 'حفظ التخصّص',
  'field.majors.unsave': 'إزالة من المحفوظات',
  'field.majors.guestNote': 'الحفظ بحتاج حساب — وضع الضيف ما بيحتفظ بشي بعد ما تسكّر التطبيق.',

  // ── Published floors vs competitive minimums ──────────────────────────────
  'field.min.title': 'الحدود الدنيا المنشورة للالتحاق',
  'field.min.lead': 'هذه هي العلامة التي تسمح لك بالتقديم، وليست العلامة التي تضمن القبول.',
  'field.min.public': 'الجامعات الرسميّة',
  'field.min.private': 'الجامعات الخاصّة',
  'field.min.tierCol': 'الفئة',
  'field.min.percentCol': 'الحدّ الأدنى',
  'field.min.arabicWording': 'صياغة الفئات وأسماء الكليات منقولة حرفيّاً عن النصّ العربي للقرار، ولذلك تبقى بالعربيّة في الواجهة الإنجليزيّة أيضاً.',
  'field.min.subjectFloorTitle': 'شرط إضافي على كلّ الفئات',
  'field.min.competitiveTitle': 'ما لم يُنشر بعد',
  'field.min.competitive': 'الحدود الدنيا التنافسيّة لعام 2026/2027 — أي علامة آخر طالب مقبول في كلّ تخصّص — لم تُنشر بعد. المنشور حاليّاً قاعدة بيانات الحدود الدنيا للسنوات الخمس السابقة، مقدَّمة كمؤشّر لترتيب الرغبات لا كنتيجة لهذا العام. الحدّ التنافسيّ دائماً أعلى من الحدّ أدناه، وغالباً بفارق كبير.',
  'field.min.competitiveLink': 'قاعدة بيانات السنوات السابقة — admhec.gov.jo',
  'field.min.decision': 'المصدر',

  // ── The published table is today's table, not a permanent one ─────────────
  'field.change.title': 'الحقول الستّة ليست نهائيّة',
  'field.change.body': 'أُعلن تعديل يبدأ من 2026/2027 لجيل 2009 يدمج الحقول الستّة في أربعة، مع إلزاميّة اللغة الإنجليزيّة للجميع وإضافة الرياضيات إلى امتحان الصفّ الحادي عشر. جداول الكليات المعدّلة لم تُنشر، فالمعروض هنا هو آخر جدول منشور رسميّاً — صحيح لهذه اللحظة، لا إلى الأبد.',

  'field.disclaimer': 'هذه الصفحة تعرض وثيقة منشورة ولا تصدر قراراً. القبول النهائي مرجعه وحدة تنسيق القبول الموحّد والجامعة نفسها.',
} as const;

export const fieldEn = {
  'field.nav': 'My field',
  'field.title': 'My field and colleges',
  'field.subtitle': 'The colleges your path opens, as published by the Higher Education Council',

  // ── The source card ───────────────────────────────────────────────────────
  'field.source.title': 'Where these lists come from',
  'field.source.decision': 'Higher Education Council decision — page dated',
  'field.source.effective': 'Effective from the academic year',
  'field.source.retrieved': 'Transcribed from the source on',
  'field.source.pdfAcademic': 'Academic track file (PDF) — copy shipped in the app',
  'field.source.pdfVocational': 'Vocational track file (PDF) — copy shipped in the app',
  'field.source.pdfAcademicLive': 'Academic track file on the Ministry’s site',
  'field.source.pdfVocationalLive': 'Vocational track file on the Ministry’s site',
  'field.source.page': 'The announcement on the Ministry’s site',
  'field.source.localCopy': 'The first two files ship inside the app itself, so the lists can be checked against the source document with no internet. The two links below open the copies published on the Ministry’s site.',
  'field.source.verbatim': 'College and specialisation names appear in the document’s own wording, with nothing improved or added.',

  // ── Choosing / exploring a path ───────────────────────────────────────────
  'field.picker.title': 'Choose what to look at',
  'field.picker.hint': 'Still in grade 9 or 10? Switch the field or programme and see what each choice opens before you decide.',
  'field.picker.track': 'Track',
  'field.picker.mine': 'This is your saved path',
  'field.picker.exploring': 'Exploring — this is not your saved path',
  'field.picker.backToMine': 'Back to my path',
  'field.picker.noPath': 'You have not set your path yet',
  'field.picker.noPathBody': 'You can explore any field from here. Once you set your path in your profile, this screen opens on it directly and the rest of the app knows which colleges are yours.',
  'field.picker.setPath': 'Set my path',
  'field.picker.pickDetail': 'Pick a field or a programme to see its lists.',

  // ── The college lists ─────────────────────────────────────────────────────
  'field.colleges.bachelor': 'Permitted colleges and specialisations',
  'field.colleges.bachelorLead': 'Leads to the conventional university bachelor.',
  'field.colleges.diploma': 'Intermediate diploma',
  'field.colleges.diplomaLead': 'The intermediate-diploma specialisations permitted for this programme.',
  'field.colleges.technical': 'Technical / applied bachelor',
  'field.colleges.technicalLead': 'The technical/applied bachelor specialisations permitted for this programme.',
  'field.colleges.differentDegrees': 'These two lists are two different degrees, not two levels of one: the intermediate diploma is a qualification in its own right, and the technical/applied bachelor is a bachelor’s degree distinct from the academic one. That is why they are shown apart.',
  // Four keys because Arabic needs four; English fills them with two forms.
  'field.colleges.oneItem': 'one entry in the official list',
  'field.colleges.twoItems': 'two entries in the official list',
  'field.colleges.fewItems': 'entries in the official list',
  'field.colleges.itemsLabel': 'entries in the official list',
  'field.colleges.none': 'The published document lists no entries here.',
  'field.military': 'Entries marked with an asterisk belong to the military colleges, per the document’s own footnote.',

  // ── Paths the published table does not answer for ─────────────────────────
  'field.legacy.title': 'Previous plan: no published table',
  'field.legacy.body': 'The Higher Education Council table covers new-plan students from 2026/2027. We found no equivalent official table for the pre-2023 branches, and we will not guess one. Previous-plan students follow the admission rules published for their own year.',
  'field.legacy.explore': 'You can still use the selector above to see what any new-plan field or programme opens.',

  // ── The app's own majors, partitioned by this path ────────────────────────
  'field.majors.title': 'This app’s majors, seen from this path',
  'field.majors.lead': 'These are the majors that exist inside the app’s tools, sorted by what the displayed path opens. The full official list is the one above.',
  'field.majors.eligible': 'Open — bachelor',
  'field.majors.technical': 'Open — technical/applied bachelor',
  'field.majors.blocked': 'Not open from this path',
  'field.majors.blockedLead': 'Per the Higher Education Council table, these are not reachable from the displayed path.',
  'field.majors.within': 'within',
  'field.majors.withinHint': 'The document named a broader college that covers this major rather than naming the major itself.',
  'field.majors.none': 'No majors in this group for this path.',
  'field.majors.save': 'Save this major',
  'field.majors.unsave': 'Remove from saved',
  'field.majors.guestNote': 'Saving needs an account — guest mode keeps nothing once you close the app.',

  // ── Published floors vs competitive minimums ──────────────────────────────
  'field.min.title': 'Published minimum averages to apply',
  'field.min.lead': 'This is the mark that lets you apply. It is not the mark that gets you in.',
  'field.min.public': 'Public universities',
  'field.min.private': 'Private universities',
  'field.min.tierCol': 'Group',
  'field.min.percentCol': 'Minimum',
  'field.min.arabicWording': 'Group wording and college names are quoted verbatim from the Arabic text of the decision, which is why they stay in Arabic in the English interface too.',
  'field.min.subjectFloorTitle': 'One more condition on every group',
  'field.min.competitiveTitle': 'What has not been published',
  'field.min.competitive': 'The competitive minimums for 2026/2027 — the mark of the last student admitted to each programme — have not been published. What is published is a database of the minimums for the five preceding years, offered as an indicator for ranking your choices, not as this year’s result. The competitive minimum is always higher than the floor below, often by a wide margin.',
  'field.min.competitiveLink': 'Database of previous years — admhec.gov.jo',
  'field.min.decision': 'Source',

  // ── The published table is today's table, not a permanent one ─────────────
  'field.change.title': 'The six fields are not permanent',
  'field.change.body': 'An amendment announced for 2026/2027 (the 2009 cohort) merges the six fields into four, makes English compulsory for everyone and adds Mathematics to the grade-11 sitting. The amended college tables have not been published, so what is shown here is the last officially published table — correct as of now, not forever.',

  'field.disclaimer': 'This screen shows a published document; it issues no decision. Final admission rests with the Unified Admission Coordination Unit and the university itself.',
} as const;
