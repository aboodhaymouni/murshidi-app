// i18n namespace: auth, session, profile — and the app shell's crash screen.
// Owner: F4 (see docs/FIX_SPEC.md §2). Keys must exist in ar and en alike.
//
// Privacy copy rule: this app has no backend, and the copy below says exactly
// what that means — no national ID, local storage only, a password digest that
// is not device-level protection, and the one case where text does leave the
// device (the AI advisor). Do not upgrade these claims.
//
// Two password lines exist on purpose. `auth.privacy.hash` is true only where
// WebCrypto exists; on a plain-http origin `crypto.subtle` is undefined and
// src/lib/account.ts stores a 128-bit checksum instead. The screen picks the
// line that matches what the code actually did — see `passwordHashMode()`.
//
// The names of tracks, fields, programmes and legacy branches are NOT here.
// They are the Ministry's own wording and live in src/lib/tawjihi.ts, which
// serves them per language; copying them into this file would create a second
// source that could drift from the published table.

export const authAr = {
  // ── Auth screen ──
  'auth.title': 'حسابك في مُرشِدي',
  'auth.subtitle': 'اختر كيف تريد الدخول',
  'auth.doors.hint': 'ثلاثة خيارات: تسجيل دخول، حساب جديد، أو تصفّح كضيف.',
  'auth.tab.signIn': 'تسجيل الدخول',
  'auth.tab.signUp': 'حساب جديد',

  'auth.field.name': 'الاسم الكامل',
  'auth.field.namePh': 'مثال: عبد الرحمن الهيموني',
  'auth.field.nameHint': 'الاسم هو معرّفك على هذا الجهاز — لا نطلب بريداً ولا رقم هاتف.',
  'auth.field.grade': 'معدّل التوجيهي (اختياري)',
  'auth.field.gradePh': 'من 0 إلى 100',
  'auth.field.gradeHint': 'اتركه فارغاً إن لم تصدر نتيجتك بعد؛ تقدر تضيفه لاحقاً.',
  'auth.field.city': 'المحافظة',
  'auth.field.password': 'كلمة السرّ',
  'auth.field.passwordPh': '4 أحرف على الأقلّ',
  'auth.showPassword': 'إظهار كلمة السرّ',
  'auth.hidePassword': 'إخفاء كلمة السرّ',

  'auth.submit.signIn': 'دخول',
  'auth.submit.signUp': 'إنشاء الحساب',
  'auth.submit.busy': 'جارٍ…',

  'auth.error.nameTaken': 'هذا الاسم مسجّل على هذا الجهاز — سجّل الدخول بدل إنشاء حساب.',
  'auth.error.notFound': 'لا يوجد حساب بهذا الاسم على هذا الجهاز — أنشئ حساباً جديداً.',
  'auth.error.wrongPassword': 'كلمة السرّ غير صحيحة.',
  'auth.error.invalid': 'تأكّد من الاسم (حرفان فأكثر) وكلمة السرّ (4 أحرف فأكثر).',
  'auth.error.storage': 'تعذّر الحفظ على هذا الجهاز — قد يكون تخزين المتصفّح ممتلئاً أو محجوباً.',
  'auth.error.grade': 'المعدّل لازم يكون رقماً بين 0 و100.',
  'auth.error.unverifiableHere': 'هذا الحساب أُنشئ على اتصال آمن (https أو localhost)، وهذا الاتصال ما بيوفّر أدوات التحقّق نفسها، فما بنقدر نتأكّد من كلمة السرّ هون. افتح التطبيق على العنوان الآمن نفسه.',
  'auth.error.track': 'اختر مسارك في التوجيهي أوّلاً.',
  'auth.error.path': 'أكمل اختيارك: بعد المسار، اختر الحقل أو البرنامج أو الفرع.',

  // ── Study path (track → field / programme / branch) ──
  'auth.path.legend': 'مسارك في التوجيهي',
  'auth.path.hint': 'الأردن استبدل فروع التوجيهي القديمة بمسارين. مسارك وحقلك هما اللي بيحدّدا الكليات اللي بتقدر تقدّم عليها، فمنسألك مرّة وحدة هون.',
  'auth.path.step1': 'الخطوة 1 — المسار',
  'auth.path.step2': 'الخطوة 2 — التفصيل',
  'auth.track.academicLead': 'ستّة حقول، وبيوصّل للبكالوريوس الجامعي المعتاد.',
  'auth.track.vocationalLead': 'عشرة برامج، وبيوصّل للدبلوم المتوسّط وللبكالوريوس التقني/التطبيقي.',
  'auth.track.legacyLead': 'فروع ما قبل 2023 لمن ما زال يُكمل بالخطّة القديمة.',
  'auth.path.chooseField': 'الحقل الأكاديمي',
  'auth.path.chooseProgram': 'البرنامج المهني',
  'auth.path.chooseBranch': 'فرع الخطّة القديمة',
  'auth.path.fieldPh': 'اختر الحقل',
  'auth.path.programPh': 'اختر البرنامج',
  'auth.path.branchPh': 'اختر الفرع',
  'auth.path.changeTrack': 'تغيير المسار',
  'auth.path.none': 'غير محدّد',
  'auth.path.legacyNote': 'جدول الكليات الصادر عن مجلس التعليم العالي يخصّ طلبة الخطّة الجديدة من 2026/2027؛ ما لقينا جدولاً رسميّاً مكافئاً لفروع الخطّة القديمة، فما منعرض تقديراً.',
  'auth.path.vocationalNote': 'المسار المهني جزء من التوجيهي وليس بديلاً عنه: الطالب بيحمل شهادة الثانويّة العامّة الأردنيّة (المسار المهني) وإلى جانبها دبلوم BTEC من Pearson.',

  // ── Non-secure origin: what really happens to the password ──
  'auth.insecure.title': 'تنبيه: هذا العنوان غير آمن (http)',
  'auth.insecure.body': 'على عنوان غير آمن، المتصفّح ما بيوفّر WebCrypto، فكلمة السرّ بتنحفظ كبصمة تدقيق طولها 128 بت بدل SHA-256. الحساب محليّ على هذا الجهاز في الحالتين، بس الفرق حقيقي — لا تستخدم كلمة سرّ تستعملها في خدمة ثانية.',

  'auth.guest.title': 'تصفّح كضيف',
  'auth.guest.desc': 'كلّ الأدوات مفتوحة، بس ما بينحفظ شي لحسابك: لا تقارير ولا تخصّصات محفوظة.',
  'auth.guest.cta': 'متابعة كضيف',
  'auth.guest.badge': 'ضيف',
  'auth.guest.badgeTitle': 'تتصفّح كضيف — سجّل الدخول لحفظ تقاريرك',
  'auth.guest.upgrade': 'إنشاء حساب لحفظ بياناتي',

  'auth.gate.signInNeeded': 'اختر طريقة الدخول للمتابعة.',
  'auth.gate.accountNeeded': 'هذه الصفحة تحتاج حساباً لأنّها تحفظ بيانات — وضع الضيف ما بيحفظ.',

  'auth.already.title': 'أنت مسجّل الدخول بالفعل',
  'auth.already.continue': 'المتابعة إلى المنصّة',
  'auth.already.switch': 'الخروج وتسجيل دخول بحساب آخر',

  'auth.privacy.title': 'خصوصيّتك بوضوح',
  'auth.privacy.noId': 'لا نطلب رقماً وطنيّاً ولا بريداً إلكترونيّاً ولا رقم هاتف.',
  'auth.privacy.local': 'الحساب والمعدّل والمسار تُحفظ في تخزين متصفّح هذا الجهاز فقط — ما في خادم عنا تُرفع إليه.',
  'auth.privacy.hash': 'كلمة السرّ تُحفظ كبصمة SHA-256 لا كنصّ صريح. هذا يمنع قراءتها بالعين من تخزين المتصفّح، لكنّه ليس حمايةً ممّن يمسك الجهاز نفسه — فلا تستخدم كلمة سرّ تستعملها في خدمة أخرى.',
  'auth.privacy.hashWeak': 'على هذا العنوان غير الآمن تُحفظ كلمة السرّ كبصمة تدقيق 128 بت لا كـ SHA-256، لأنّ المتصفّح ما بيتيح WebCrypto هون. ما بتنحفظ كنصّ صريح، لكنّها ليست حمايةً ممّن يمسك الجهاز — فلا تستخدم كلمة سرّ تستعملها في خدمة أخرى.',
  'auth.privacy.ai': 'الاستثناء الوحيد: لمّا تستخدم المستشار الذكيّ، يُرسَل نصّ سؤالك إلى مزوّد النموذج ليُجيب عنه.',
  'auth.privacy.wipe': 'مسح بيانات المتصفّح يمسح الحساب معه — ما في نسخة احتياطيّة عنا.',

  // ── Profile ──
  'profile.guest.title': 'أنت في وضع الضيف',
  'profile.guest.desc': 'تقدر تستخدم كلّ الأدوات. الحساب بيخلّي تقاريرك وتخصّصاتك المحفوظة ترجع معك في المرّة الجاية على هذا الجهاز.',
  'profile.guest.cta': 'تسجيل الدخول أو إنشاء حساب',
  'profile.pathLabel': 'المسار',
  'profile.noGrade': 'المعدّل غير مُدخَل',
  'profile.path.set': 'حدّد مسارك وحقلك',
  'profile.path.setSub': 'بدونه ما بنقدر نعرض الكليات المسموحة لك — ولن نخمّنها.',
  'profile.field.open': 'حقلي وكلياتي',
  'profile.field.openSub': 'الكليات اللي بيفتحها مسارك حسب جدول مجلس التعليم العالي',
  'profile.activity.toolsUsed': 'أدوات استخدمتها',
  'profile.activity.savedMajors': 'تخصّصات محفوظة',
  'profile.activity.savedReports': 'تقارير محفوظة',
  'profile.activity.empty': 'ما في نشاط بعد. الأرقام بتبدأ من صفر وبتزيد لمّا تستخدم الأدوات.',
  'profile.activity.note': 'هذه الأرقام محسوبة من استخدامك الفعليّ على هذا الجهاز.',

  'profile.section.account': 'الحساب',
  'profile.section.data': 'بياناتي',
  'profile.section.danger': 'إجراءات حسّاسة',

  'profile.edit.open': 'تعديل بياناتي',
  'profile.edit.openSub': 'الاسم، المعدّل، المحافظة، المسار',
  'profile.edit.title': 'تعديل البيانات',
  'profile.edit.subtitle': 'تُحفظ على هذا الجهاز فقط',
  'profile.edit.save': 'حفظ التعديلات',
  'profile.edit.saved': 'تمّ حفظ التعديلات.',
  'profile.edit.cancel': 'إلغاء',
  'profile.edit.error': 'تعذّر الحفظ: تأكّد من الاسم (حرفان فأكثر) وأنّه غير مستخدم لحساب آخر على هذا الجهاز.',

  'profile.reports.title': 'تقاريري',
  'profile.reports.none': 'ما في تقارير محفوظة بعد.',
  'profile.reports.interests': 'تقرير اختبار الميول',
  'profile.reports.roi': 'تقرير حاسبة العائد',
  'profile.reports.compare': 'تقرير مقارنة تخصّصات',
  'profile.reports.open': 'فتح',
  'profile.savedMajors.none': 'ما حفظت أيّ تخصّص بعد — تقدر تحفظ من صفحة «حقلي وكلياتي».',
  // Arabic counts one, two, 3–10 and 11+ differently. The first two carry the
  // count inside the word, so the screen drops the digit for those.
  'profile.savedMajors.countOne': 'تخصّص واحد محفوظ',
  'profile.savedMajors.countTwo': 'تخصّصان محفوظان',
  'profile.savedMajors.countFew': 'تخصّصات محفوظة',
  'profile.savedMajors.count': 'تخصّصاً محفوظاً',
  'profile.savedMajors.remove': 'إزالة من المحفوظات',

  'profile.export.title': 'تنزيل بياناتي',
  'profile.export.sub': 'ملفّ JSON فيه ملفّك ونشاطك — من دون كلمة السرّ.',
  'profile.export.done': 'تمّ تنزيل الملفّ.',
  'profile.export.failed': 'تعذّر إنشاء الملفّ على هذا المتصفّح.',

  'profile.privacy.title': 'كيف تُحفظ بياناتك',
  'profile.share.title': 'مشاركة التطبيق',
  'profile.share.copied': 'تمّ نسخ الرابط.',
  'profile.share.failed': 'تعذّرت المشاركة من هذا المتصفّح.',

  'profile.signOut.title': 'تسجيل الخروج',
  'profile.signOut.guest': 'إنهاء وضع الضيف',
  'profile.delete.title': 'حذف الحساب',
  'profile.delete.sub': 'يمسح الحساب وكلّ ما يخصّه على هذا الجهاز.',
  'profile.delete.confirmTitle': 'تأكيد حذف الحساب',
  'profile.delete.confirmBody': 'رح يُمسح من هذا الجهاز: اسمك ومعدّلك ومسارك، سجلّ نشاطك وتخصّصاتك المحفوظة، تقرير اختبار الميول، ومحادثتك كاملة مع المستشار الذكيّ. ما في نسخة احتياطيّة، والخطوة ما بترجع.',
  'profile.delete.confirmCta': 'احذف الحساب نهائيّاً',
  'profile.delete.cancel': 'تراجع',
  'profile.delete.done': 'تمّ حذف الحساب من هذا الجهاز.',

  // ── Profile footer: the emblem is never left to speak for itself ──────────
  'profile.footer.independent': 'تطبيق إرشادي مستقلّ — لا يمثّل جهة حكوميّة ولا يحمل اعتماداً منها.',
  'profile.footer.dataSource': 'يعرض بيانات منشورة من وزارة التعليم العالي والبحث العلمي ودائرة الإحصاءات العامّة، والوزارة مذكورة هنا كمصدر لهذه البيانات لا كشريك.',

  // ── App shell: what a crash looks like instead of a blank page ──
  'shell.error.title': 'تعذّر عرض هذه الشاشة',
  'shell.error.body': 'صار خطأ غير متوقّع أثناء العرض. هذه شاشة التطبيق البديلة، مش صفحة فاضية.',
  'shell.error.kept': 'بياناتك على هذا الجهاز ما تأثّرت.',
  'shell.error.reload': 'إعادة تحميل التطبيق',
} as const;

export const authEn = {
  // ── Auth screen ──
  'auth.title': 'Your Murshidi account',
  'auth.subtitle': 'Choose how you want to continue',
  'auth.doors.hint': 'Three ways in: sign in, create an account, or browse as a guest.',
  'auth.tab.signIn': 'Sign in',
  'auth.tab.signUp': 'New account',

  'auth.field.name': 'Full name',
  'auth.field.namePh': 'e.g. Abdulrahman Alhaimouni',
  'auth.field.nameHint': 'Your name is your identifier on this device — no email, no phone number.',
  'auth.field.grade': 'Tawjihi average (optional)',
  'auth.field.gradePh': '0 to 100',
  'auth.field.gradeHint': 'Leave it empty if your result is not out yet; you can add it later.',
  'auth.field.city': 'Governorate',
  'auth.field.password': 'Password',
  'auth.field.passwordPh': 'At least 4 characters',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',

  'auth.submit.signIn': 'Sign in',
  'auth.submit.signUp': 'Create account',
  'auth.submit.busy': 'Working…',

  'auth.error.nameTaken': 'That name already exists on this device — sign in instead.',
  'auth.error.notFound': 'No account with that name on this device — create one.',
  'auth.error.wrongPassword': 'Wrong password.',
  'auth.error.invalid': 'Check the name (2+ characters) and password (4+ characters).',
  'auth.error.storage': 'Could not save on this device — browser storage may be full or blocked.',
  'auth.error.grade': 'The average must be a number between 0 and 100.',
  'auth.error.unverifiableHere': 'This account was created on a secure address (https or localhost). This address does not offer the same verification tools, so the password cannot be checked here. Open the app on that secure address instead.',
  'auth.error.track': 'Choose your Tawjihi track first.',
  'auth.error.path': 'Finish the choice: after the track, pick the field, programme or branch.',

  // ── Study path (track → field / programme / branch) ──
  'auth.path.legend': 'Your Tawjihi path',
  'auth.path.hint': 'Jordan replaced the old Tawjihi branches with two tracks. Your track and field decide which colleges you may apply to, so we ask once here.',
  'auth.path.step1': 'Step 1 — track',
  'auth.path.step2': 'Step 2 — detail',
  'auth.track.academicLead': 'Six fields, leading to the conventional university bachelor.',
  'auth.track.vocationalLead': 'Ten programmes, leading to the intermediate diploma and the technical/applied bachelor.',
  'auth.track.legacyLead': 'The pre-2023 branches, for students still finishing under the previous plan.',
  'auth.path.chooseField': 'Academic field',
  'auth.path.chooseProgram': 'Vocational programme',
  'auth.path.chooseBranch': 'Previous-plan branch',
  'auth.path.fieldPh': 'Select a field',
  'auth.path.programPh': 'Select a programme',
  'auth.path.branchPh': 'Select a branch',
  'auth.path.changeTrack': 'Change track',
  'auth.path.none': 'Not set',
  'auth.path.legacyNote': 'The Higher Education Council college table covers new-plan students from 2026/2027. We found no equivalent official table for the previous plan’s branches, so we show no estimate.',
  'auth.path.vocationalNote': 'The vocational track is part of Tawjihi, not a replacement for it: the student holds the Jordanian General Secondary Certificate (vocational track) alongside a Pearson BTEC diploma.',

  // ── Non-secure origin: what really happens to the password ──
  'auth.insecure.title': 'Note: this address is not secure (http)',
  'auth.insecure.body': 'On a non-secure address the browser does not provide WebCrypto, so your password is stored as a 128-bit checksum rather than a SHA-256 digest. The account is local to this device either way, but the difference is real — do not reuse a password from another service.',

  'auth.guest.title': 'Browse as a guest',
  'auth.guest.desc': 'Every tool is open, but nothing is kept for you: no saved reports, no saved majors.',
  'auth.guest.cta': 'Continue as guest',
  'auth.guest.badge': 'Guest',
  'auth.guest.badgeTitle': 'Browsing as a guest — sign in to keep your reports',
  'auth.guest.upgrade': 'Create an account to save my data',

  'auth.gate.signInNeeded': 'Choose how to continue.',
  'auth.gate.accountNeeded': 'This page needs an account because it saves data — guest mode does not save.',

  'auth.already.title': 'You are already signed in',
  'auth.already.continue': 'Continue to the platform',
  'auth.already.switch': 'Sign out and use another account',

  'auth.privacy.title': 'Your privacy, plainly',
  'auth.privacy.noId': 'We ask for no national ID, no email address and no phone number.',
  'auth.privacy.local': 'Your account, average and path are kept in this device’s browser storage only — we run no server for them to be uploaded to.',
  'auth.privacy.hash': 'Your password is stored as a SHA-256 digest, not as plain text. That stops it being read by eye out of browser storage, but it is not protection against someone holding this device — so do not reuse a password from another service.',
  'auth.privacy.hashWeak': 'On this non-secure address your password is stored as a 128-bit checksum, not a SHA-256 digest, because the browser does not offer WebCrypto here. It is still not stored as plain text, but it is not protection against someone holding this device — so do not reuse a password from another service.',
  'auth.privacy.ai': 'The one exception: when you use the AI advisor, the text of your question is sent to the model provider so it can answer.',
  'auth.privacy.wipe': 'Clearing your browser data deletes the account with it — we hold no backup.',

  // ── Profile ──
  'profile.guest.title': 'You are in guest mode',
  'profile.guest.desc': 'You can use every tool. An account is what brings your reports and saved majors back next time on this device.',
  'profile.guest.cta': 'Sign in or create an account',
  'profile.pathLabel': 'Path',
  'profile.noGrade': 'No average entered',
  'profile.path.set': 'Set your track and field',
  'profile.path.setSub': 'Without it we cannot show which colleges are open to you — and we will not guess.',
  'profile.field.open': 'My field and colleges',
  'profile.field.openSub': 'The colleges your path opens, per the Higher Education Council table',
  'profile.activity.toolsUsed': 'Tools you used',
  'profile.activity.savedMajors': 'Saved majors',
  'profile.activity.savedReports': 'Saved reports',
  'profile.activity.empty': 'No activity yet. These start at zero and grow as you use the tools.',
  'profile.activity.note': 'These numbers are counted from what you actually did on this device.',

  'profile.section.account': 'Account',
  'profile.section.data': 'My data',
  'profile.section.danger': 'Sensitive actions',

  'profile.edit.open': 'Edit my details',
  'profile.edit.openSub': 'Name, average, governorate, path',
  'profile.edit.title': 'Edit details',
  'profile.edit.subtitle': 'Saved on this device only',
  'profile.edit.save': 'Save changes',
  'profile.edit.saved': 'Changes saved.',
  'profile.edit.cancel': 'Cancel',
  'profile.edit.error': 'Could not save: check the name (2+ characters) and that no other account on this device uses it.',

  'profile.reports.title': 'My reports',
  'profile.reports.none': 'No saved reports yet.',
  'profile.reports.interests': 'Interests test report',
  'profile.reports.roi': 'Return calculator report',
  'profile.reports.compare': 'Major comparison report',
  'profile.reports.open': 'Open',
  'profile.savedMajors.none': 'You have not saved a major yet — you can save them from “My field and colleges”.',
  // Four keys because Arabic needs four; English fills them with two forms.
  'profile.savedMajors.countOne': 'one saved major',
  'profile.savedMajors.countTwo': 'two saved majors',
  'profile.savedMajors.countFew': 'saved majors',
  'profile.savedMajors.count': 'saved majors',
  'profile.savedMajors.remove': 'Remove from saved',

  'profile.export.title': 'Download my data',
  'profile.export.sub': 'A JSON file with your profile and activity — without the password.',
  'profile.export.done': 'File downloaded.',
  'profile.export.failed': 'This browser could not create the file.',

  'profile.privacy.title': 'How your data is stored',
  'profile.share.title': 'Share the app',
  'profile.share.copied': 'Link copied.',
  'profile.share.failed': 'Sharing is not available in this browser.',

  'profile.signOut.title': 'Sign out',
  'profile.signOut.guest': 'Leave guest mode',
  'profile.delete.title': 'Delete account',
  'profile.delete.sub': 'Erases the account and everything belonging to it on this device.',
  'profile.delete.confirmTitle': 'Confirm account deletion',
  'profile.delete.confirmBody': 'This erases from this device: your name, average and path; your activity log and saved majors; your interests-test report; and your entire conversation with the AI advisor. There is no backup and the step cannot be undone.',
  'profile.delete.confirmCta': 'Delete the account permanently',
  'profile.delete.cancel': 'Go back',
  'profile.delete.done': 'The account was deleted from this device.',

  // ── Profile footer: the emblem is never left to speak for itself ──────────
  'profile.footer.independent': 'Independent guidance app — it represents no government body and carries no endorsement from one.',
  'profile.footer.dataSource': 'It shows data published by the Ministry of Higher Education and Scientific Research and the Department of Statistics; the ministry is named here as the source of that data, not as a partner.',

  // ── App shell: what a crash looks like instead of a blank page ──
  'shell.error.title': 'This screen could not be shown',
  'shell.error.body': 'An unexpected error happened while rendering. This is the app’s fallback screen, not a blank page.',
  'shell.error.kept': 'Your data on this device is untouched.',
  'shell.error.reload': 'Reload the app',
} as const;
