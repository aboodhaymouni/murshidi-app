// i18n namespace: ai
// Owner: see docs/BUILD_SPEC.md. Add keys as `'ai.someKey': '…'` in BOTH objects.
// Keys must exist in ar and en with identical key sets.

export const aiAr = {
  // Header
  'ai.title': 'الاستشارة الأكاديميّة',
  'ai.subtitle': 'مرشد إرشادي يجيب من بيانات التطبيق',
  'ai.status.online': 'متّصل',
  'ai.status.offline': 'وضع محلّي',

  // Opening message
  'ai.intro':
    'مرحباً بك في الاستشارة الأكاديميّة.\n\nأجيب على أسئلتك عن اختيار التخصّص الجامعي اعتماداً على بيانات هذا التطبيق. إن لم يكن الرقم متوفّراً لديّ سأقول ذلك صراحةً بدل تخمينه.\n\nما سؤالك؟',

  // The student's path — what the advisor's eligibility answers are based on
  'ai.path.title': 'مسارك الدراسي',
  'ai.path.unset': 'غير محدّد',
  'ai.path.grounded':
    'تعتمد إجابات الإتاحة على جدول الكليّات المسموح بها لمسارك الصادر عن مجلس التعليم العالي (قرار 8 أيلول 2024، يسري من 2026/2027).',
  'ai.path.unsetNote':
    'لم تحدّد مسارك بعد (أكاديمي / مهني BTEC / الخطة القديمة)، لذلك لن يقول لك المرشد إن كان تخصّص ما متاحاً لك أو غير متاح — سيجيب عن المعدّل والكلفة فقط.',
  'ai.path.cta': 'حدّد مسارك',

  // Suggested questions
  'ai.suggestions.title': 'أمثلة على الأسئلة',
  'ai.suggest.1': 'معدّلي 78 وأرغب بدراسة الطبّ، ما الخيارات المتاحة؟',
  'ai.suggest.2': 'يضغط عليّ الأهل لاختيار الهندسة، كيف أتصرّف؟',
  'ai.suggest.3': 'ما الفرق بين علوم الحاسوب وعلم البيانات؟',
  'ai.suggest.4': 'كم تبلغ الرسوم الحكوميّة لدراسة الصيدلة؟',
  'ai.suggest.5': 'معدّلي 82، ما التخصّصات التي تناسبني؟',
  'ai.suggest.6': 'هل يفتح لي مساري الدراسي تخصّص علوم الحاسوب؟',

  // Composer
  'ai.input.placeholder': 'اكتب سؤالك هنا…',
  'ai.send': 'إرسال',
  'ai.stop': 'إيقاف',
  'ai.retry': 'إعادة المحاولة',
  'ai.clear': 'مسح المحادثة',
  'ai.clear.confirm': 'تأكيد المسح',

  // Message meta
  'ai.role.you': 'أنت',
  'ai.role.advisor': 'المرشد',
  'ai.source.ai': 'إجابة النموذج',
  'ai.source.local': 'إجابة محلّيّة',
  'ai.source.localHint': 'تعذّر الوصول إلى النماذج، فأُنشئت هذه الإجابة محلّيّاً من بيانات التطبيق دون إنترنت.',
  'ai.stopped': 'أوقفت الإجابة',
  'ai.thinking': 'يكتب…',

  // Settings panel
  'ai.settings.on': 'الوضع الذكي مفعّل',
  'ai.settings.off': 'الوضع المحلّي',
  'ai.settings.onDesc': 'إجابات حيّة عبر OpenRouter مع تدرّج احتياطي',
  'ai.settings.offDesc': 'إجابات محلّيّة من بيانات التطبيق، تعمل بلا إنترنت',
  'ai.settings.title': 'إعدادات النموذج',
  'ai.settings.keyLabel': 'مفتاح OpenRouter بديل (اختياري)',
  'ai.settings.keySet': 'مفتاح التطبيق مفعّل — اتركه فارغاً',
  'ai.settings.keyEmpty': 'الصق مفتاحاً من openrouter.ai/keys',
  'ai.settings.modelLabel': 'النموذج المفضّل',
  'ai.settings.chainNote':
    'إن تعذّر النموذج المختار يُعاد الطلب مرّة واحدة، ثمّ يُجرَّب النموذج التالي، وأخيراً تُبنى الإجابة محلّيّاً من بيانات التطبيق.',
  'ai.settings.quota':
    'حدّ الطلبات اليوميّة للنماذج المجّانيّة على هذا المفتاح: 1000 طلب/يوم (حسب نقطة /api/v1/key لدى OpenRouter، فُحصت في 16 أيلول 2026). النماذج المجّانيّة تشترك في حصّة المزوّد وقد تردّ 429 مؤقّتاً.',
  'ai.model.free': 'مجّاني',
  'ai.model.paid': 'مدفوع',
  'ai.model.default': 'الافتراضي',

  // Notices
  'ai.notice.local': 'النماذج غير متاحة حاليّاً — هذه إجابة محلّيّة مبنيّة على بيانات التطبيق.',
  'ai.notice.stopped': 'أوقفتَ الإجابة. يمكنك إعادة المحاولة.',
  'ai.notice.saved': 'تُحفظ المحادثة على هذا الجهاز فقط.',

  // Disclaimer
  'ai.disclaimer':
    'إجابات إرشاديّة تولّدها نماذج لغويّة، وليست استشارة من مرشد أكاديمي أو نفسي معتمد، ولا تمثّل أيّ جهة رسميّة. راجع القرار مع أهلك ومرشد مدرستك.',
} as const;

export const aiEn = {
  // Header
  'ai.title': 'Academic Advisor',
  'ai.subtitle': 'Guidance answered from the app’s own data',
  'ai.status.online': 'Online',
  'ai.status.offline': 'Offline mode',

  // Opening message
  'ai.intro':
    'Welcome to the academic advisor.\n\nI answer questions about choosing a university major using this app’s data. If a figure is not available to me, I will say so rather than guess it.\n\nWhat would you like to ask?',

  // The student's path — what the advisor's eligibility answers are based on
  'ai.path.title': 'Your study path',
  'ai.path.unset': 'Not set',
  'ai.path.grounded':
    'Answers about what is open to you follow the Higher Education Council’s table of permitted colleges for your path (decision of 8 September 2024, effective 2026/2027).',
  'ai.path.unsetNote':
    'You have not set your path yet (academic / vocational BTEC / previous plan), so the advisor will not tell you whether a major is open to you — it will answer on averages and cost only.',
  'ai.path.cta': 'Set your path',

  // Suggested questions
  'ai.suggestions.title': 'Example questions',
  'ai.suggest.1': 'My average is 78 and I want to study Medicine — what are my options?',
  'ai.suggest.2': 'My family is pushing me towards Engineering. What should I do?',
  'ai.suggest.3': 'What is the difference between Computer Science and Data Science?',
  'ai.suggest.4': 'How much is public-university tuition for Pharmacy?',
  'ai.suggest.5': 'My average is 82 — which majors suit me?',
  'ai.suggest.6': 'Does my study path open Computer Science to me?',

  // Composer
  'ai.input.placeholder': 'Type your question…',
  'ai.send': 'Send',
  'ai.stop': 'Stop',
  'ai.retry': 'Retry',
  'ai.clear': 'Clear conversation',
  'ai.clear.confirm': 'Confirm clear',

  // Message meta
  'ai.role.you': 'You',
  'ai.role.advisor': 'Advisor',
  'ai.source.ai': 'Model answer',
  'ai.source.local': 'Offline answer',
  'ai.source.localHint': 'The models could not be reached, so this answer was built locally from the app data with no network.',
  'ai.stopped': 'You stopped this answer',
  'ai.thinking': 'Typing…',

  // Settings panel
  'ai.settings.on': 'Smart mode active',
  'ai.settings.off': 'Offline mode',
  'ai.settings.onDesc': 'Live answers through OpenRouter with a fallback chain',
  'ai.settings.offDesc': 'Local answers from the app data, works with no network',
  'ai.settings.title': 'Model settings',
  'ai.settings.keyLabel': 'Alternative OpenRouter key (optional)',
  'ai.settings.keySet': 'App key active — leave this blank',
  'ai.settings.keyEmpty': 'Paste a key from openrouter.ai/keys',
  'ai.settings.modelLabel': 'Preferred model',
  'ai.settings.chainNote':
    'If the selected model fails, the request is retried once, then the next model is tried, and finally the answer is built locally from the app data.',
  'ai.settings.quota':
    'Daily free-model allowance on this key: 1,000 requests/day (per OpenRouter’s own /api/v1/key endpoint, checked 16 Sep 2026). Free models share the provider pool and may return 429 temporarily.',
  'ai.model.free': 'Free',
  'ai.model.paid': 'Paid',
  'ai.model.default': 'Default',

  // Notices
  'ai.notice.local': 'The models are unavailable right now — this answer was built locally from the app data.',
  'ai.notice.stopped': 'You stopped the answer. You can retry.',
  'ai.notice.saved': 'This conversation is stored on this device only.',

  // Disclaimer
  'ai.disclaimer':
    'These are guidance answers generated by language models. They are not advice from a licensed academic or psychological counsellor and do not represent any official body. Review your decision with your family and your school counsellor.',
} as const;
