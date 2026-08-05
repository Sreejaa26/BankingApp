define([], function () {
  'use strict';

  const DEFAULT_LOCALE = 'en-IN';
  const supportedLocales = ['en-IN', 'hi-IN', 'bn', 'te', 'mr', 'ta', 'es-ES', 'fr-FR', 'ar-SA', 'zh-Hans-CN'];
  const languageOptions = [
    { value: 'en-IN', label: 'English' },
    { value: 'hi-IN', label: 'हिन्दी' },
    { value: 'bn', label: 'বাংলা' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'mr', label: 'मराठी' },
    { value: 'ta', label: 'தமிழ்' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'ar-SA', label: 'العربية' },
    { value: 'zh-Hans-CN', label: '简体中文' }
  ];
  const navKeys = ['dashboard', 'accounts', 'transactions', 'beneficiaries', 'transfer', 'loans', 'cards', 'notifications', 'admin'];
  const shellKeys = ['workspace', 'personalBanking', 'primaryCustomer', 'admin', 'helpSupport', 'search', 'home', 'needHelp', 'helpCopy', 'secureSession', 'privacy', 'support'];
  const dashboardKeys = ['greeting', 'overview', 'download', 'transfer', 'totalBalance', 'acrossAccounts', 'monthlyIncome', 'monthlySpending', 'incomeShare'];
  const pageRoutes = ['accounts', 'transactions', 'beneficiaries', 'transfer', 'loans', 'cards', 'notifications', 'admin'];

  function assignValues(target, prefix, keys, values) {
    keys.forEach(function (key, index) { target[prefix + key] = values[index]; });
  }

  function coreMessages(nav, shell, dashboard, pages) {
    const result = {};
    assignValues(result, 'nav.', navKeys, nav);
    assignValues(result, 'shell.', shellKeys, shell);
    assignValues(result, 'dashboard.', dashboardKeys, dashboard);
    pageRoutes.forEach(function (route, index) {
      result['page.' + route + '.title'] = pages[index][0];
      result['page.' + route + '.action'] = pages[index][1];
    });
    return result;
  }
  const messages = {
    'en-IN': {
      'language.english': 'English',
      'language.hindi': 'हिन्दी',
      'shell.workspace': 'Workspace',
      'shell.personalBanking': 'Personal Banking',
      'shell.primaryCustomer': 'Primary customer',
      'shell.admin': 'Admin',
      'shell.helpSupport': 'Help & support',
      'shell.search': 'Search',
      'shell.home': 'Home',
      'shell.needHelp': 'Need help?',
      'shell.helpCopy': 'Chat with us, 24/7',
      'shell.secureSession': 'Secure session · 256-bit encryption',
      'shell.privacy': 'Privacy',
      'shell.support': 'Support',
      'nav.dashboard': 'Dashboard',
      'nav.accounts': 'Accounts',
      'nav.transactions': 'Transactions',
      'nav.beneficiaries': 'Beneficiaries',
      'nav.transfer': 'Transfer Money',
      'nav.loans': 'Loans',
      'nav.cards': 'Cards',
      'nav.notifications': 'Notifications',
      'nav.admin': 'Admin Dashboard',
      'dashboard.greeting': 'Good morning, Sreeja.',
      'dashboard.overview': 'Your finances are looking healthy. Here’s today’s overview.',
      'dashboard.download': 'Download statement',
      'dashboard.transfer': 'Make a transfer',
      'dashboard.totalBalance': 'Total balance',
      'dashboard.acrossAccounts': 'Across 3 accounts',
      'dashboard.monthlyIncome': 'Monthly income',
      'dashboard.monthlySpending': 'Monthly spending',
      'dashboard.incomeShare': '46% of monthly income',
      'page.accounts.eyebrow': 'Your money',
      'page.accounts.title': 'Accounts',
      'page.accounts.description': 'Review balances, account details, statements, and interest earned.',
      'page.accounts.action': 'Open an account',
      'page.accounts.highlight0': 'Total balance',
      'page.accounts.highlight1': 'Available now',
      'page.accounts.highlight2': 'Active accounts',
      'page.transactions.eyebrow': 'Activity',
      'page.transactions.title': 'Transactions',
      'page.transactions.description': 'Search, filter, categorize, and export your complete transaction history.',
      'page.transactions.action': 'Download statement',
      'page.transactions.highlight0': 'This month',
      'page.transactions.highlight1': 'Incoming',
      'page.transactions.highlight2': 'Transactions',
      'page.beneficiaries.eyebrow': 'Payments',
      'page.beneficiaries.title': 'Beneficiaries',
      'page.beneficiaries.description': 'Manage trusted people and businesses you send money to.',
      'page.beneficiaries.action': 'Add beneficiary',
      'page.beneficiaries.highlight0': 'Active',
      'page.beneficiaries.highlight1': 'Recently paid',
      'page.beneficiaries.highlight2': 'Pending approval',
      'page.transfer.eyebrow': 'Move money',
      'page.transfer.title': 'Transfer Money',
      'page.transfer.description': 'Make secure transfers to a beneficiary or any other bank account.',
      'page.transfer.action': 'New transfer',
      'page.transfer.highlight0': 'Daily limit',
      'page.transfer.highlight1': 'Available today',
      'page.transfer.highlight2': 'Scheduled',
      'page.loans.eyebrow': 'Borrowing',
      'page.loans.title': 'Loans',
      'page.loans.description': 'Track repayments, view loan details, and explore eligible offers.',
      'page.loans.action': 'Apply for a new loan',
      'page.loans.highlight0': 'Outstanding',
      'page.loans.highlight1': 'Next EMI',
      'page.loans.highlight2': 'Due date',
      'page.cards.eyebrow': 'Card controls',
      'page.cards.title': 'Cards',
      'page.cards.description': 'Manage limits, card applications, usage controls, and card activity.',
      'page.cards.action': 'Manage cards',
      'page.cards.highlight0': 'Available credit',
      'page.cards.highlight1': 'Current spend',
      'page.cards.highlight2': 'Active cards',
      'page.notifications.eyebrow': 'Stay informed',
      'page.notifications.title': 'Notifications',
      'page.notifications.description': 'Review security alerts, transaction updates, and account messages.',
      'page.notifications.action': 'Notification settings',
      'page.notifications.highlight0': 'Unread',
      'page.notifications.highlight1': 'Security alerts',
      'page.notifications.highlight2': 'This week',
      'page.admin.eyebrow': 'Operations',
      'page.admin.title': 'Admin Dashboard',
      'page.admin.description': 'Monitor customer activity, approvals, service health, and operational risk.',
      'page.admin.action': 'Review approvals',
      'page.admin.highlight0': 'Active customers',
      'page.admin.highlight1': 'Pending reviews',
      'page.admin.highlight2': 'Service health'
    },
    'hi-IN': {
      'language.english': 'English',
      'language.hindi': 'हिन्दी',
      'shell.workspace': 'कार्यक्षेत्र',
      'shell.personalBanking': 'व्यक्तिगत बैंकिंग',
      'shell.primaryCustomer': 'प्राथमिक ग्राहक',
      'shell.admin': 'प्रशासन',
      'shell.helpSupport': 'सहायता और समर्थन',
      'shell.search': 'खोजें',
      'shell.home': 'होम',
      'shell.needHelp': 'मदद चाहिए?',
      'shell.helpCopy': 'हमसे 24/7 चैट करें',
      'shell.secureSession': 'सुरक्षित सत्र · 256-बिट एन्क्रिप्शन',
      'shell.privacy': 'गोपनीयता',
      'shell.support': 'सहायता',
      'nav.dashboard': 'डैशबोर्ड',
      'nav.accounts': 'खाते',
      'nav.transactions': 'लेन-देन',
      'nav.beneficiaries': 'लाभार्थी',
      'nav.transfer': 'धन हस्तांतरण',
      'nav.loans': 'ऋण',
      'nav.cards': 'कार्ड',
      'nav.notifications': 'सूचनाएँ',
      'nav.admin': 'प्रशासन डैशबोर्ड',
      'dashboard.greeting': 'सुप्रभात, श्रीजा।',
      'dashboard.overview': 'आपकी वित्तीय स्थिति स्वस्थ दिख रही है। आज का सारांश देखें।',
      'dashboard.download': 'स्टेटमेंट डाउनलोड करें',
      'dashboard.transfer': 'धन हस्तांतरित करें',
      'dashboard.totalBalance': 'कुल शेष',
      'dashboard.acrossAccounts': '3 खातों में',
      'dashboard.monthlyIncome': 'मासिक आय',
      'dashboard.monthlySpending': 'मासिक खर्च',
      'dashboard.incomeShare': 'मासिक आय का 46%',
      'page.accounts.eyebrow': 'आपका धन',
      'page.accounts.title': 'खाते',
      'page.accounts.description': 'शेष राशि, खाते का विवरण, स्टेटमेंट और अर्जित ब्याज देखें।',
      'page.accounts.action': 'खाता खोलें',
      'page.accounts.highlight0': 'कुल शेष',
      'page.accounts.highlight1': 'अभी उपलब्ध',
      'page.accounts.highlight2': 'सक्रिय खाते',
      'page.transactions.eyebrow': 'गतिविधि',
      'page.transactions.title': 'लेन-देन',
      'page.transactions.description': 'अपने पूरे लेन-देन इतिहास को खोजें, फ़िल्टर करें और निर्यात करें।',
      'page.transactions.action': 'स्टेटमेंट डाउनलोड करें',
      'page.transactions.highlight0': 'इस महीने',
      'page.transactions.highlight1': 'प्राप्त राशि',
      'page.transactions.highlight2': 'लेन-देन',
      'page.beneficiaries.eyebrow': 'भुगतान',
      'page.beneficiaries.title': 'लाभार्थी',
      'page.beneficiaries.description': 'विश्वसनीय लोगों और व्यवसायों का प्रबंधन करें।',
      'page.beneficiaries.action': 'लाभार्थी जोड़ें',
      'page.beneficiaries.highlight0': 'सक्रिय',
      'page.beneficiaries.highlight1': 'हाल में भुगतान',
      'page.beneficiaries.highlight2': 'स्वीकृति लंबित',
      'page.transfer.eyebrow': 'धन भेजें',
      'page.transfer.title': 'धन हस्तांतरण',
      'page.transfer.description': 'लाभार्थी या किसी अन्य बैंक खाते में सुरक्षित रूप से धन भेजें।',
      'page.transfer.action': 'नया हस्तांतरण',
      'page.transfer.highlight0': 'दैनिक सीमा',
      'page.transfer.highlight1': 'आज उपलब्ध',
      'page.transfer.highlight2': 'निर्धारित',
      'page.loans.eyebrow': 'उधार',
      'page.loans.title': 'ऋण',
      'page.loans.description': 'भुगतान ट्रैक करें, ऋण विवरण देखें और पात्र प्रस्ताव खोजें।',
      'page.loans.action': 'नए ऋण के लिए आवेदन करें',
      'page.loans.highlight0': 'बकाया',
      'page.loans.highlight1': 'अगली ईएमआई',
      'page.loans.highlight2': 'देय तिथि',
      'page.cards.eyebrow': 'कार्ड नियंत्रण',
      'page.cards.title': 'कार्ड',
      'page.cards.description': 'सीमा, कार्ड आवेदन, उपयोग नियंत्रण और गतिविधि प्रबंधित करें।',
      'page.cards.action': 'कार्ड प्रबंधित करें',
      'page.cards.highlight0': 'उपलब्ध क्रेडिट',
      'page.cards.highlight1': 'वर्तमान खर्च',
      'page.cards.highlight2': 'सक्रिय कार्ड',
      'page.notifications.eyebrow': 'जानकारी रखें',
      'page.notifications.title': 'सूचनाएँ',
      'page.notifications.description': 'सुरक्षा अलर्ट, लेन-देन अपडेट और संदेश देखें।',
      'page.notifications.action': 'सूचना सेटिंग',
      'page.notifications.highlight0': 'अपठित',
      'page.notifications.highlight1': 'सुरक्षा अलर्ट',
      'page.notifications.highlight2': 'इस सप्ताह',
      'page.admin.eyebrow': 'संचालन',
      'page.admin.title': 'प्रशासन डैशबोर्ड',
      'page.admin.description': 'ग्राहक गतिविधि, स्वीकृतियाँ, सेवा स्वास्थ्य और जोखिम देखें।',
      'page.admin.action': 'स्वीकृतियाँ देखें',
      'page.admin.highlight0': 'सक्रिय ग्राहक',
      'page.admin.highlight1': 'लंबित समीक्षाएँ',
      'page.admin.highlight2': 'सेवा स्वास्थ्य'
    },
    'bn': coreMessages(
      ['ড্যাশবোর্ড','অ্যাকাউন্ট','লেনদেন','সুবিধাভোগী','অর্থ স্থানান্তর','ঋণ','কার্ড','বিজ্ঞপ্তি','অ্যাডমিন ড্যাশবোর্ড'],
      ['কর্মক্ষেত্র','ব্যক্তিগত ব্যাংকিং','প্রধান গ্রাহক','অ্যাডমিন','সহায়তা ও সমর্থন','অনুসন্ধান','হোম','সাহায্য দরকার?','আমাদের সঙ্গে ২৪/৭ চ্যাট করুন','নিরাপদ সেশন · ২৫৬-বিট এনক্রিপশন','গোপনীয়তা','সহায়তা'],
      ['শুভ সকাল, শ্রীজা।','আপনার আর্থিক অবস্থা ভালো দেখাচ্ছে। আজকের সারাংশ দেখুন।','স্টেটমেন্ট ডাউনলোড করুন','অর্থ স্থানান্তর করুন','মোট ব্যালেন্স','৩টি অ্যাকাউন্টে','মাসিক আয়','মাসিক ব্যয়','মাসিক আয়ের ৪৬%'],
      [['অ্যাকাউন্ট','অ্যাকাউন্ট খুলুন'],['লেনদেন','স্টেটমেন্ট ডাউনলোড করুন'],['সুবিধাভোগী','সুবিধাভোগী যোগ করুন'],['অর্থ স্থানান্তর','নতুন স্থানান্তর'],['ঋণ','নতুন ঋণের জন্য আবেদন করুন'],['কার্ড','কার্ড পরিচালনা করুন'],['বিজ্ঞপ্তি','বিজ্ঞপ্তি সেটিংস'],['অ্যাডমিন ড্যাশবোর্ড','অনুমোদন পর্যালোচনা করুন']]
    ),
    'te': coreMessages(
      ['డ్యాష్‌బోర్డ్','ఖాతాలు','లావాదేవీలు','లబ్ధిదారులు','డబ్బు బదిలీ','రుణాలు','కార్డులు','నోటిఫికేషన్లు','అడ్మిన్ డ్యాష్‌బోర్డ్'],
      ['కార్యస్థలం','వ్యక్తిగత బ్యాంకింగ్','ప్రాథమిక కస్టమర్','అడ్మిన్','సహాయం మరియు మద్దతు','వెతకండి','హోమ్','సహాయం కావాలా?','మాతో 24/7 చాట్ చేయండి','సురక్షిత సెషన్ · 256-బిట్ ఎన్‌క్రిప్షన్','గోప్యత','మద్దతు'],
      ['శుభోదయం, శ్రీజా.','మీ ఆర్థిక స్థితి బాగుంది. నేటి సారాంశాన్ని చూడండి.','స్టేట్‌మెంట్ డౌన్‌లోడ్ చేయండి','డబ్బు బదిలీ చేయండి','మొత్తం బ్యాలెన్స్','3 ఖాతాల్లో','నెలవారీ ఆదాయం','నెలవారీ ఖర్చు','నెలవారీ ఆదాయంలో 46%'],
      [['ఖాతాలు','ఖాతా తెరవండి'],['లావాదేవీలు','స్టేట్‌మెంట్ డౌన్‌లోడ్ చేయండి'],['లబ్ధిదారులు','లబ్ధిదారుని జోడించండి'],['డబ్బు బదిలీ','కొత్త బదిలీ'],['రుణాలు','కొత్త రుణానికి దరఖాస్తు చేయండి'],['కార్డులు','కార్డులను నిర్వహించండి'],['నోటిఫికేషన్లు','నోటిఫికేషన్ సెట్టింగ్‌లు'],['అడ్మిన్ డ్యాష్‌బోర్డ్','ఆమోదాలను సమీక్షించండి']]
    ),
    'mr': coreMessages(
      ['डॅशबोर्ड','खाती','व्यवहार','लाभार्थी','पैसे हस्तांतरण','कर्जे','कार्डे','सूचना','प्रशासन डॅशबोर्ड'],
      ['कार्यक्षेत्र','वैयक्तिक बँकिंग','प्राथमिक ग्राहक','प्रशासन','मदत आणि समर्थन','शोधा','होम','मदत हवी आहे?','आमच्याशी २४/७ चॅट करा','सुरक्षित सत्र · २५६-बिट एन्क्रिप्शन','गोपनीयता','समर्थन'],
      ['शुभ सकाळ, श्रीजा.','तुमची आर्थिक स्थिती चांगली दिसत आहे. आजचा आढावा पहा.','स्टेटमेंट डाउनलोड करा','पैसे हस्तांतरित करा','एकूण शिल्लक','३ खात्यांमध्ये','मासिक उत्पन्न','मासिक खर्च','मासिक उत्पन्नाच्या ४६%'],
      [['खाती','खाते उघडा'],['व्यवहार','स्टेटमेंट डाउनलोड करा'],['लाभार्थी','लाभार्थी जोडा'],['पैसे हस्तांतरण','नवीन हस्तांतरण'],['कर्जे','नवीन कर्जासाठी अर्ज करा'],['कार्डे','कार्डे व्यवस्थापित करा'],['सूचना','सूचना सेटिंग्ज'],['प्रशासन डॅशबोर्ड','मंजुरींचे पुनरावलोकन करा']]
    ),
    'ta': coreMessages(
      ['டாஷ்போர்டு','கணக்குகள்','பரிவர்த்தனைகள்','பயனாளிகள்','பணப் பரிமாற்றம்','கடன்கள்','அட்டைகள்','அறிவிப்புகள்','நிர்வாக டாஷ்போர்டு'],
      ['பணியிடம்','தனிப்பட்ட வங்கி','முதன்மை வாடிக்கையாளர்','நிர்வாகம்','உதவி மற்றும் ஆதரவு','தேடுக','முகப்பு','உதவி வேண்டுமா?','எங்களுடன் 24/7 அரட்டையடிக்கவும்','பாதுகாப்பான அமர்வு · 256-பிட் குறியாக்கம்','தனியுரிமை','ஆதரவு'],
      ['காலை வணக்கம், ஸ்ரீஜா.','உங்கள் நிதிநிலை நன்றாக உள்ளது. இன்றைய சுருக்கத்தைப் பாருங்கள்.','அறிக்கையைப் பதிவிறக்குக','பணத்தை மாற்றுக','மொத்த இருப்பு','3 கணக்குகளில்','மாத வருமானம்','மாதச் செலவு','மாத வருமானத்தின் 46%'],
      [['கணக்குகள்','கணக்கைத் திறக்கவும்'],['பரிவர்த்தனைகள்','அறிக்கையைப் பதிவிறக்குக'],['பயனாளிகள்','பயனாளியைச் சேர்க்கவும்'],['பணப் பரிமாற்றம்','புதிய பரிமாற்றம்'],['கடன்கள்','புதிய கடனுக்கு விண்ணப்பிக்கவும்'],['அட்டைகள்','அட்டைகளை நிர்வகிக்கவும்'],['அறிவிப்புகள்','அறிவிப்பு அமைப்புகள்'],['நிர்வாக டாஷ்போர்டு','ஒப்புதல்களை மதிப்பாய்வு செய்க']]
    ),
    'es-ES': coreMessages(
      ['Panel','Cuentas','Transacciones','Beneficiarios','Transferir dinero','Préstamos','Tarjetas','Notificaciones','Panel de administración'],
      ['Espacio de trabajo','Banca personal','Cliente principal','Administración','Ayuda y soporte','Buscar','Inicio','¿Necesitas ayuda?','Chatea con nosotros 24/7','Sesión segura · Cifrado de 256 bits','Privacidad','Soporte'],
      ['Buenos días, Sreeja.','Tus finanzas se ven saludables. Consulta el resumen de hoy.','Descargar extracto','Hacer una transferencia','Saldo total','En 3 cuentas','Ingresos mensuales','Gastos mensuales','46% de los ingresos mensuales'],
      [['Cuentas','Abrir una cuenta'],['Transacciones','Descargar extracto'],['Beneficiarios','Añadir beneficiario'],['Transferir dinero','Nueva transferencia'],['Préstamos','Solicitar un nuevo préstamo'],['Tarjetas','Gestionar tarjetas'],['Notificaciones','Configuración de notificaciones'],['Panel de administración','Revisar aprobaciones']]
    ),
    'fr-FR': coreMessages(
      ['Tableau de bord','Comptes','Transactions','Bénéficiaires','Transférer de l’argent','Prêts','Cartes','Notifications','Tableau d’administration'],
      ['Espace de travail','Banque personnelle','Client principal','Administration','Aide et assistance','Rechercher','Accueil','Besoin d’aide ?','Discutez avec nous 24 h/24','Session sécurisée · Chiffrement 256 bits','Confidentialité','Assistance'],
      ['Bonjour, Sreeja.','Vos finances sont en bonne santé. Consultez le résumé du jour.','Télécharger le relevé','Effectuer un virement','Solde total','Sur 3 comptes','Revenus mensuels','Dépenses mensuelles','46 % des revenus mensuels'],
      [['Comptes','Ouvrir un compte'],['Transactions','Télécharger le relevé'],['Bénéficiaires','Ajouter un bénéficiaire'],['Transférer de l’argent','Nouveau virement'],['Prêts','Demander un nouveau prêt'],['Cartes','Gérer les cartes'],['Notifications','Paramètres de notification'],['Tableau d’administration','Examiner les approbations']]
    ),
    'ar-SA': coreMessages(
      ['لوحة المعلومات','الحسابات','المعاملات','المستفيدون','تحويل الأموال','القروض','البطاقات','الإشعارات','لوحة الإدارة'],
      ['مساحة العمل','الخدمات المصرفية الشخصية','العميل الأساسي','الإدارة','المساعدة والدعم','بحث','الرئيسية','هل تحتاج إلى مساعدة؟','تحدث معنا على مدار الساعة','جلسة آمنة · تشفير 256 بت','الخصوصية','الدعم'],
      ['صباح الخير، سريجا.','وضعك المالي جيد. اطّلع على ملخص اليوم.','تنزيل كشف الحساب','إجراء تحويل','الرصيد الإجمالي','عبر 3 حسابات','الدخل الشهري','الإنفاق الشهري','46٪ من الدخل الشهري'],
      [['الحسابات','فتح حساب'],['المعاملات','تنزيل كشف الحساب'],['المستفيدون','إضافة مستفيد'],['تحويل الأموال','تحويل جديد'],['القروض','التقدم بطلب قرض جديد'],['البطاقات','إدارة البطاقات'],['الإشعارات','إعدادات الإشعارات'],['لوحة الإدارة','مراجعة الموافقات']]
    ),
    'zh-Hans-CN': coreMessages(
      ['仪表板','账户','交易','收款人','转账','贷款','银行卡','通知','管理仪表板'],
      ['工作区','个人银行','主要客户','管理','帮助与支持','搜索','首页','需要帮助吗？','全天候与我们聊天','安全会话 · 256 位加密','隐私','支持'],
      ['早上好，Sreeja。','您的财务状况良好。查看今日概览。','下载对账单','进行转账','总余额','共 3 个账户','月收入','月支出','占月收入的 46%'],
      [['账户','开立账户'],['交易','下载对账单'],['收款人','添加收款人'],['转账','新建转账'],['贷款','申请新贷款'],['银行卡','管理银行卡'],['通知','通知设置'],['管理仪表板','审核审批']]
    )
  };

  function normalizeLocale(locale) {
    return supportedLocales.indexOf(locale) >= 0 ? locale : DEFAULT_LOCALE;
  }

  function initialLocale() {
    try { return normalizeLocale(window.localStorage.getItem('northstar-locale')); } catch (error) { return DEFAULT_LOCALE; }
  }

  function translate(locale, key, fallback) {
    const active = messages[normalizeLocale(locale)] || messages[DEFAULT_LOCALE];
    return active[key] || messages[DEFAULT_LOCALE][key] || fallback || key;
  }

  function persistLocale(locale) {
    const normalized = normalizeLocale(locale);
    document.documentElement.lang = normalized;
    document.documentElement.dir = normalized === 'ar-SA' ? 'rtl' : 'ltr';
    try { window.localStorage.setItem('northstar-locale', normalized); } catch (error) { /* Storage can be unavailable in private contexts. */ }
    return normalized;
  }

  function formatCurrency(locale, value) {
    return new Intl.NumberFormat(normalizeLocale(locale), { style: 'currency', currency: 'INR', maximumFractionDigits: Number(value) % 1 ? 2 : 0 }).format(value);
  }

  function formatDate(locale, value, options) {
    return new Intl.DateTimeFormat(normalizeLocale(locale), options || { dateStyle: 'medium' }).format(value);
  }

  return { supportedLocales, languageOptions, initialLocale, translate, persistLocale, formatCurrency, formatDate };
});
