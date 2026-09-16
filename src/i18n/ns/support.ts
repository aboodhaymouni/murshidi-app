// i18n namespace: support
// Owner: F2 (scholarships + graduate stories). Keys are `support.*` and must
// exist in BOTH objects with identical key sets.
//
// Honesty note for whoever edits this next — it is the whole reason the
// scholarships copy reads the way it does:
//
// The previous build attached invented grant values, invented eligibility
// conditions and specific invented 2026 application deadlines to five real,
// named Jordanian bodies. Nothing in this repository sources any of it, so all
// of it was removed rather than re-badged: a badge does not make a wrong
// deadline harmless to a student who plans around it. What survives is the part
// the app can stand behind without a citation — the KINDS of body that fund
// university study, the questions to put to any of them, and the documents to
// have ready. No amount, no condition and no date appears on that screen, and
// none may be added here without a published source and its date.

export const supportAr = {
  // ── Scholarships ────────────────────────────────────────────────────────
  'support.sch.title': 'المنح الدراسيّة',
  'support.sch.subtitle': 'أين تبحث، وماذا تسأل',

  'support.sch.notice.title': 'ما تعطيه هذه الصفحة وما لا تعطيه',
  'support.sch.notice.body':
    'لا تنشر مُرشِدي قيمة أيّ منحة، ولا شروط الأهليّة فيها، ولا موعد التقديم إليها. هذه الثلاثة تتغيّر كلّ سنة وتُعلنها الجهة المانحة نفسها على قنواتها الرسميّة، وهي وحدها المرجع.',
  'support.sch.notice.why':
    'موعد قديم أو شرط غير دقيق يُعرض هنا قد يُضيّع على طالب فرصة حقيقيّة، لذلك لا يُعرض. ما تجده في الأسفل: أين تبحث، وماذا تسأل، وبأيّ مستندات تذهب.',

  'support.sch.funders.title': 'أين تبحث عن التمويل',
  'support.sch.funders.noNames':
    'لا تُسمّي هذه الصفحة جهة بعينها. أنواع الجهات ثابتة، أمّا أسماء البرامج وشروطها ومواعيدها فتتغيّر من سنة إلى أخرى، والجهة نفسها هي مَن يُعلنها.',
  'support.sch.funders.hint': 'اضغط أيّ بطاقة لعرض الأسئلة التي تُطرح على هذا النوع من الجهات.',
  'support.sch.funders.askTitle': 'ما الذي تسأل عنه هنا',

  'support.sch.f.gov.title': 'صناديق دعم الطلبة الحكوميّة',
  'support.sch.f.gov.what':
    'جهات حكوميّة معنيّة بدعم طلبة الجامعات. تُعلن ما لديها من دعم وشروطه وقنوات التقديم إليه على مواقعها الرسميّة.',
  'support.sch.f.gov.a1': 'ما القنوات الرسميّة لهذا الدعم، وهل التقديم إلكتروني أم عبر الجامعة؟',
  'support.sch.f.gov.a2': 'هل الدعم مرتبط بالجامعات الرسميّة فقط أم يشمل الخاصّة كذلك؟',
  'support.sch.f.gov.a3': 'ما المستندات الرسميّة المطلوبة، ومن الجهة التي تُصدر كلّاً منها؟',

  'support.sch.f.university.title': 'المنح والإعفاءات داخل الجامعة',
  'support.sch.f.university.what':
    'الجامعة التي ستلتحق بها هي أقرب جهة إليك. اسأل عمادة شؤون الطلبة فيها مباشرةً عمّا تديره من دعم لطلبتها.',
  'support.sch.f.university.a1': 'هل يوجد دعم يُمنح عند القبول، وآخر يُمنح بعد إتمام فصل أو سنة؟',
  'support.sch.f.university.a2': 'هل تشمل المفاضلة الطلبة الجدد أم المستمرّين فقط؟',
  'support.sch.f.university.a3': 'من الموظّف المسؤول، وما رقم مكتبه أو بريده الرسمي؟',

  'support.sch.f.corporate.title': 'الشركات ومؤسّساتها الاجتماعيّة',
  'support.sch.f.corporate.what':
    'شركات ومؤسّسات تدعم الطلبة ضمن برامجها المجتمعيّة. تُعلن برامجها عادةً على مواقعها وصفحاتها الرسميّة في موسم محدّد من السنة.',
  'support.sch.f.corporate.a1': 'هل يقتصر البرنامج على تخصّصات بعينها؟',
  'support.sch.f.corporate.a2': 'هل يرافق الدعم تدريب أو التزام عمل بعد التخرّج؟',
  'support.sch.f.corporate.a3': 'متى يُفتح باب التقديم، وأين يُعلن ذلك بالضبط؟',

  'support.sch.f.charity.title': 'الصناديق الخيريّة والوقفيّة',
  'support.sch.f.charity.what':
    'جمعيّات وصناديق تُعنى بالحالة الماديّة للأسرة أكثر ممّا تُعنى بالتحصيل وحده. غالباً ما يبدأ الطريق إليها من الجهة المحليّة في منطقتك.',
  'support.sch.f.charity.a1': 'ما المستند الذي يُثبت الحالة الماديّة، ومن يُصدره؟',
  'support.sch.f.charity.a2': 'هل الدعم نقدي أم يُدفع مباشرةً إلى الجامعة؟',
  'support.sch.f.charity.a3': 'هل يتكرّر كلّ فصل، وما الذي يوقفه؟',

  'support.sch.f.external.title': 'المنح الخارجيّة والسفارات',
  'support.sch.f.external.what':
    'منح تقدّمها دول أو جامعات خارج الأردن، وتُعلن عبر سفاراتها أو مواقعها. تحقّق دائماً من أنّ الإعلان صادر عن الجهة نفسها لا عن وسيط.',
  'support.sch.f.external.a1': 'هل تُشترط شهادة لغة، وما الحدّ المطلوب فيها ومتى يجب أن تكون جاهزة؟',
  'support.sch.f.external.a2': 'هل تشمل المنحة السفر والسكن والتأمين، أم الرسوم فقط؟',
  'support.sch.f.external.a3': 'هل الشهادة الناتجة معادَلة في الأردن، وما إجراءات معادلتها؟',

  'support.sch.f.loan.title': 'القروض الطلابيّة والدفع المؤجّل',
  'support.sch.f.loan.what':
    'هذا ليس منحة بل التزام مالي يُسدَّد لاحقاً. لا توقّع قبل أن تعرف المبلغ الكلّي الذي ستدفعه في النهاية، لا القسط الشهري وحده.',
  'support.sch.f.loan.a1': 'ما إجمالي ما سيُسدَّد مقابل ما سيُصرف، مكتوباً في العقد؟',
  'support.sch.f.loan.a2': 'متى يبدأ السداد: أثناء الدراسة أم بعد التخرّج؟',
  'support.sch.f.loan.a3': 'ماذا يحدث عند التعثّر أو الانقطاع عن الدراسة؟',

  'support.sch.ask.title': 'ستّة أسئلة تُطرح على أيّ جهة مانحة',
  'support.sch.ask.lead': 'مهما كان نوع الجهة، هذه الأسئلة هي التي تحسم إن كان الدعم مناسباً لك فعلاً.',
  'support.sch.ask.q1': 'ما الذي تغطّيه المنحة بالضبط: الرسوم كاملةً؟ جزءاً منها؟ هل تشمل السكن أو الكتب؟',
  'support.sch.ask.q2': 'هل تُصرف مرّة واحدة أم تُجدَّد كلّ سنة؟ وما شرط التجديد؟',
  'support.sch.ask.q3': 'هل هناك حدّ أدنى للمعدّل؟ وعلى أيّ معدّل يُحسب: الثانويّة أم المعدّل الجامعي؟',
  'support.sch.ask.q4': 'هل هناك شرط للدخل أو لمكان الإقامة؟ وما المستند الذي يُثبته؟',
  'support.sch.ask.q5': 'ما آخر موعد للتقديم في هذه السنة، وأين تُعلن النتيجة؟',
  'support.sch.ask.q6': 'هل على الطالب التزام بعد التخرّج: عمل، أو خدمة، أو سداد؟',

  'support.sch.docs.title': 'جهّز ملفّك قبل أن يُفتح باب التقديم',
  'support.sch.docs.hint':
    'قائمة تُدار على هذه الشاشة فقط: لا تُحفظ على جهازك ولا تُرسل إلى أيّ جهة، وتعود فارغة عند مغادرة الصفحة.',
  'support.sch.docs.progress': 'جاهز',
  'support.sch.docs.reset': 'إفراغ القائمة',
  'support.sch.docs.d1': 'كشف علامات الثانويّة العامّة أو شهادتها',
  'support.sch.docs.d2': 'إثبات دخل الأسرة',
  'support.sch.docs.d3': 'إثبات مكان الإقامة',
  'support.sch.docs.d4': 'الهويّة الشخصيّة ودفتر العائلة',
  'support.sch.docs.d5': 'رسالة تزكية من مدرسة أو جهة تعرفك',
  'support.sch.docs.d6': 'ملف إنجازاتك وأنشطتك خارج المدرسة',

  'support.sch.avg.title': 'معدّلك كما هو في ملفّك',
  'support.sch.avg.label': 'معدّل التوجيهي',
  'support.sch.avg.body':
    'كثير من الجهات تضع حدّاً أدنى للمعدّل، ويختلف هذا الحدّ من جهة إلى أخرى ومن سنة إلى أخرى. مُرشِدي لا يعرف شرط أيّ جهة بعينها، ولا يُصدر حكماً بقبول أو رفض بناءً على المعدّل.',
  'support.sch.avg.none': 'لم تُدخل معدّلك في ملفّك بعد.',
  'support.sch.avg.guest': 'أنت تتصفّح كضيف، فلا يوجد ملف محفوظ يُقرأ منه معدّلك.',
  'support.sch.avg.cta': 'فتح الملف الشخصي',
  'support.sch.ai.cta': 'اسأل المرشد كيف تجهّز ملفّك',

  // ── Graduate stories ────────────────────────────────────────────────────
  'support.stories.title': 'تجارب الخرّيجين',
  'support.stories.subtitle': 'سرديّات توضيحيّة مُركّبة',
  'support.stories.notice.title': 'اقرأ هذا أوّلاً',
  'support.stories.notice.body':
    'هذه السرديّات كُتبت لعرض شكل شهادات الخرّيجين في النسخة الكاملة من المنصّة. لا تعود لأشخاص حقيقيّين، ولا لجامعة بعينها، والرواتب والمدد الواردة فيها توضيحيّة ولم تُؤخذ من مسح منشور. في النسخة الكاملة تُجمع الشهادات من خرّيجين فعليّين وبموافقتهم.',
  'support.stories.notice.noStats':
    'ولهذا لا تعرض هذه الصفحة أيّ متوسّط أو نسبة رضا محسوبة من هذه الأمثلة: عيّنة مكتوبة لا تُشتقّ منها إحصائيّة.',

  'support.stories.filter.all': 'الكلّ',
  'support.stories.filterTitle': 'تصفية',
  'support.stories.count': 'التجارب المعروضة',
  'support.stories.more': 'عرض بقيّة التجارب',
  'support.stories.empty': 'لا توجد تجربة ضمن هذا التصنيف.',

  'support.stories.tag.satisfied': 'يعيد الاختيار',
  'support.stories.tag.regret': 'لا يعيد الاختيار',
  'support.stories.tag.switch': 'تحوّل وظيفي',
  'support.stories.tag.travel': 'سفر',
  'support.stories.tag.remote': 'عمل عن بُعد',
  'support.stories.tag.longStudy': 'دراسة طويلة',
  'support.stories.tag.stability': 'استقرار وظيفي',

  'support.stories.uni.public': 'جامعة حكوميّة',
  'support.stories.uni.private': 'جامعة خاصّة',
  'support.stories.card.cohort': 'دفعة',
  'support.stories.card.advice': 'ما ينصح به',
  'support.stories.card.salary': 'الراتب الشهري الحالي',
  'support.stories.card.months': 'المدّة حتى أوّل وظيفة (بالأشهر)',

  'support.stories.s1.persona': 'خرّيج إعلام',
  'support.stories.s1.major': 'الإعلام',
  'support.stories.s1.quote':
    'لو رجعت بالزمن لاخترتُ تكنولوجيا المعلومات. عملتُ سنتين في إذاعة براتب 280 ديناراً، ثمّ انتقلتُ إلى التسويق الرقمي براتب 700.',
  'support.stories.s1.advice':
    'الإعلام التقليدي يضيق، والرقمي هو الذي يتّسع. من يختار الإعلام فليتخصّص في جانبه الرقمي مبكّراً.',

  'support.stories.s2.persona': 'خرّيجة علوم حاسوب',
  'support.stories.s2.major': 'علوم الحاسوب',
  'support.stories.s2.quote':
    'بدأتُ براتب 580 ديناراً كمطوّرة مبتدئة، واليوم بعد خمس سنوات راتبي 1,850 ديناراً عن بُعد لشركة أوروبيّة.',
  'support.stories.s2.advice':
    'إتقان الإنجليزيّة بجدّيّة، والمساهمة في مشاريع مفتوحة المصدر من السنة الثانية. ملفّ الأعمال الفعليّ هو ما يصنع الفرق.',

  'support.stories.s3.persona': 'خرّيج طبّ',
  'support.stories.s3.major': 'الطبّ البشري',
  'support.stories.s3.quote':
    'دراسة الطبّ شاقّة: ستّ سنوات أوّليّة، ثمّ سنوات اختصاص، وامتحانات لا تتوقّف. لكنّ العائد المعنويّ عند إنقاذ مريض كبير.',
  'support.stories.s3.advice':
    'الطبّ ليس قراراً يُتّخذ تحت ضغط الأهل. ادخله لأنّك تريده، فالطريق طويل ومرهق.',

  'support.stories.s4.persona': 'خرّيج هندسة مدنيّة',
  'support.stories.s4.major': 'الهندسة المدنيّة',
  'support.stories.s4.quote':
    'السوق المحلّي ضيّق في سنوات التخرّج الأولى، وأنا سافرتُ بعد عام وتضاعف دخلي مع بدل سكن.',
  'support.stories.s4.advice':
    'أتقن برامج التصميم والتحليل الإنشائي قبل التخرّج لا بعده؛ هي التي تفتح باب العمل خارج الأردن.',

  'support.stories.s5.persona': 'خرّيجة صيدلة',
  'support.stories.s5.major': 'الصيدلة',
  'support.stories.s5.quote':
    'الصيدلة أعطتني استقراراً. عملتُ سنتين في صيدليّة، ثمّ انتقلتُ إلى شركة أدوية كمندوبة طبّيّة براتب 850 ديناراً.',
  'support.stories.s5.advice':
    'الصناعة الدوائيّة أوسع من العمل خلف طاولة الصيدليّة. ركّزي على الإنجليزيّة وعلى حضور مهني واضح على الإنترنت.',

  'support.stories.s6.persona': 'خرّيج علم بيانات',
  'support.stories.s6.major': 'علم البيانات',
  'support.stories.s6.quote':
    'تخرّجتُ وحصلتُ بعد ثلاثة أشهر على وظيفة محلّل بيانات براتب 950 ديناراً، واليوم بعد أربع سنوات راتبي 2,100 دينار عن بُعد.',
  'support.stories.s6.advice':
    'تعلّم البرمجة وقواعد البيانات والإحصاء من السنة الأولى، وشارك في مسابقات تحليل بيانات حقيقيّة؛ خبرتها أثقل من المحاضرات.',
} as const;

export const supportEn = {
  // ── Scholarships ────────────────────────────────────────────────────────
  'support.sch.title': 'Scholarships',
  'support.sch.subtitle': 'Where to look, and what to ask',

  'support.sch.notice.title': 'What this page gives you, and what it does not',
  'support.sch.notice.body':
    'Murshidi does not publish the value of any grant, its eligibility conditions, or its application deadline. All three change every year and are announced by the funding body itself through its own official channels, which are the only reference.',
  'support.sch.notice.why':
    'An out-of-date deadline or an imprecise condition shown here could cost a student a real opportunity, so neither is shown. What follows instead: where to look, what to ask, and which documents to bring.',

  'support.sch.funders.title': 'Where to look for funding',
  'support.sch.funders.noNames':
    'This page names no individual body. The kinds of body are stable; the names of programmes, their conditions and their dates change from year to year, and the body itself is what announces them.',
  'support.sch.funders.hint': 'Tap any card to see the questions to put to that kind of body.',
  'support.sch.funders.askTitle': 'What to ask here',

  'support.sch.f.gov.title': 'Government student-support funds',
  'support.sch.f.gov.what':
    'Government bodies concerned with supporting university students. They announce whatever support they run, its conditions and how to apply on their own official sites.',
  'support.sch.f.gov.a1': 'What are the official channels for this support, and is the application online or through the university?',
  'support.sch.f.gov.a2': 'Is the support limited to public universities, or does it cover private ones too?',
  'support.sch.f.gov.a3': 'Which official documents are required, and which office issues each of them?',

  'support.sch.f.university.title': 'Grants and fee exemptions inside the university',
  'support.sch.f.university.what':
    'The university you join is the closest body to you. Ask its deanship of student affairs directly about the support it runs for its own students.',
  'support.sch.f.university.a1': 'Is there support granted on admission, and other support granted after a completed semester or year?',
  'support.sch.f.university.a2': 'Does the selection include new students, or continuing students only?',
  'support.sch.f.university.a3': 'Who is the responsible officer, and what is their office number or official email?',

  'support.sch.f.corporate.title': 'Companies and their social foundations',
  'support.sch.f.corporate.what':
    'Companies and foundations that support students through their community programmes. Such programmes are usually announced on their official sites and pages during a specific season of the year.',
  'support.sch.f.corporate.a1': 'Is the programme restricted to particular fields of study?',
  'support.sch.f.corporate.a2': 'Does the support come with training, or with a commitment to work after graduation?',
  'support.sch.f.corporate.a3': 'When do applications open, and exactly where is that announced?',

  'support.sch.f.charity.title': 'Charitable and endowment funds',
  'support.sch.f.charity.what':
    'Associations and funds that look at a family financial situation more than at marks alone. The route to them often starts with the local body in your own area.',
  'support.sch.f.charity.a1': 'Which document proves the financial situation, and who issues it?',
  'support.sch.f.charity.a2': 'Is the support paid in cash, or paid directly to the university?',
  'support.sch.f.charity.a3': 'Does it repeat each semester, and what would stop it?',

  'support.sch.f.external.title': 'Overseas scholarships and embassies',
  'support.sch.f.external.what':
    'Scholarships offered by countries or universities outside Jordan, announced through their embassies or their own sites. Always check that the announcement comes from the body itself and not from an intermediary.',
  'support.sch.f.external.a1': 'Is a language certificate required, at what level, and by when must it be ready?',
  'support.sch.f.external.a2': 'Does the scholarship cover travel, housing and insurance, or tuition only?',
  'support.sch.f.external.a3': 'Is the resulting degree recognised in Jordan, and what is the equivalency procedure?',

  'support.sch.f.loan.title': 'Student loans and deferred payment',
  'support.sch.f.loan.what':
    'This is not a grant but a financial obligation repaid later. Do not sign before you know the total amount you will pay in the end, not just the monthly instalment.',
  'support.sch.f.loan.a1': 'What is the total to be repaid against the amount disbursed, written into the contract?',
  'support.sch.f.loan.a2': 'When does repayment start: during study, or after graduation?',
  'support.sch.f.loan.a3': 'What happens if you default, or interrupt your studies?',

  'support.sch.ask.title': 'Six questions for any funding body',
  'support.sch.ask.lead': 'Whatever the kind of body, these are the questions that settle whether the support actually suits you.',
  'support.sch.ask.q1': 'What exactly does it cover: the whole tuition? part of it? does it include housing or books?',
  'support.sch.ask.q2': 'Is it paid once, or renewed every year? And what is the condition for renewal?',
  'support.sch.ask.q3': 'Is there a minimum average? And which average counts: the school certificate or the university GPA?',
  'support.sch.ask.q4': 'Is there an income or place-of-residence condition? Which document proves it?',
  'support.sch.ask.q5': 'What is this year deadline, and where is the result announced?',
  'support.sch.ask.q6': 'Is the student committed to anything after graduation: employment, service, or repayment?',

  'support.sch.docs.title': 'Get your file ready before applications open',
  'support.sch.docs.hint':
    'This checklist lives on this screen only: nothing is saved on your device, nothing is sent anywhere, and it comes back empty when you leave the page.',
  'support.sch.docs.progress': 'ready',
  'support.sch.docs.reset': 'Clear the list',
  'support.sch.docs.d1': 'Your secondary-school transcript or certificate',
  'support.sch.docs.d2': 'Proof of family income',
  'support.sch.docs.d3': 'Proof of place of residence',
  'support.sch.docs.d4': 'Your ID and family record book',
  'support.sch.docs.d5': 'A reference letter from a school or a body that knows you',
  'support.sch.docs.d6': 'A record of your achievements and activities outside school',

  'support.sch.avg.title': 'Your average, as stored in your profile',
  'support.sch.avg.label': 'Tawjihi average',
  'support.sch.avg.body':
    'Many bodies set a minimum average, and that minimum differs from one body to another and from one year to the next. Murshidi does not know the condition of any specific body, and issues no acceptance or rejection verdict from an average.',
  'support.sch.avg.none': 'You have not entered your average in your profile yet.',
  'support.sch.avg.guest': 'You are browsing as a guest, so there is no saved profile to read an average from.',
  'support.sch.avg.cta': 'Open my profile',
  'support.sch.ai.cta': 'Ask the advisor how to prepare your file',

  // ── Graduate stories ────────────────────────────────────────────────────
  'support.stories.title': 'Graduate Stories',
  'support.stories.subtitle': 'Composite, illustrative journeys',
  'support.stories.notice.title': 'Read this first',
  'support.stories.notice.body':
    'These journeys were written to show the shape graduate testimonies will take in the full version of the platform. They do not belong to real people or to any particular university, and the salaries and durations in them are illustrative, not taken from any published survey. In the full version, testimonies are collected from actual graduates with their consent.',
  'support.stories.notice.noStats':
    'That is why this page shows no average and no satisfaction rate computed from these examples: a written sample is not something you derive a statistic from.',

  'support.stories.filter.all': 'All',
  'support.stories.filterTitle': 'Filter',
  'support.stories.count': 'Stories shown',
  'support.stories.more': 'Show the remaining stories',
  'support.stories.empty': 'No story falls under this filter.',

  'support.stories.tag.satisfied': 'Would choose it again',
  'support.stories.tag.regret': 'Would not choose it again',
  'support.stories.tag.switch': 'Changed career',
  'support.stories.tag.travel': 'Worked abroad',
  'support.stories.tag.remote': 'Remote work',
  'support.stories.tag.longStudy': 'Long path',
  'support.stories.tag.stability': 'Job stability',

  'support.stories.uni.public': 'Public university',
  'support.stories.uni.private': 'Private university',
  'support.stories.card.cohort': 'Class of',
  'support.stories.card.advice': 'What they would tell you',
  'support.stories.card.salary': 'Current monthly salary',
  'support.stories.card.months': 'Time to first job (months)',

  'support.stories.s1.persona': 'Media graduate',
  'support.stories.s1.major': 'Media',
  'support.stories.s1.quote':
    'If I could go back I would choose information technology. I spent two years at a radio station on 280 dinars, then moved into digital marketing on 700.',
  'support.stories.s1.advice':
    'Traditional media is narrowing and the digital side is the one that is widening. Anyone choosing media should specialise in its digital side early.',

  'support.stories.s2.persona': 'Computer science graduate',
  'support.stories.s2.major': 'Computer Science',
  'support.stories.s2.quote':
    'I started on 580 dinars as a junior developer. Five years on I earn 1,850 dinars working remotely for a European company.',
  'support.stories.s2.advice':
    'Take English seriously, and start contributing to open-source projects in your second year. A real portfolio is what makes the difference.',

  'support.stories.s3.persona': 'Medicine graduate',
  'support.stories.s3.major': 'Human Medicine',
  'support.stories.s3.quote':
    'Medicine is hard going: six years first, then specialisation years, and exams that never stop. But what you get back when you save a patient is large.',
  'support.stories.s3.advice':
    'Medicine is not a decision to take under family pressure. Enter it because you want it — the road is long and tiring.',

  'support.stories.s4.persona': 'Civil engineering graduate',
  'support.stories.s4.major': 'Civil Engineering',
  'support.stories.s4.quote':
    'The local market is tight in the first years after graduation. I travelled after a year and my income doubled, with a housing allowance.',
  'support.stories.s4.advice':
    'Master the design and structural-analysis software before you graduate, not after; that is what opens work outside Jordan.',

  'support.stories.s5.persona': 'Pharmacy graduate',
  'support.stories.s5.major': 'Pharmacy',
  'support.stories.s5.quote':
    'Pharmacy gave me stability. I worked two years in a pharmacy, then moved to a medicines company as a medical representative on 850 dinars.',
  'support.stories.s5.advice':
    'The pharmaceutical industry is wider than the counter. Focus on English and on a clear professional presence online.',

  'support.stories.s6.persona': 'Data science graduate',
  'support.stories.s6.major': 'Data Science',
  'support.stories.s6.quote':
    'I graduated and three months later took a data analyst job on 950 dinars. Four years on I earn 2,100 dinars working remotely.',
  'support.stories.s6.advice':
    'Learn programming, databases and statistics from year one, and enter real data-analysis competitions; that experience weighs more than lectures.',
} as const;
