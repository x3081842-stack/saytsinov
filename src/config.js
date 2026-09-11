const CONFIG = {
  girlName: "Ruxshona",
  boyName: "Xurshid",
  adminPassword: "sevgi2025",

  /* Telegram: @BotFather dan token oling.
     Chat ID uchun @userinfobot ga yozing.
     Bo'sh qoldirsangiz ham sayt ishlaydi. */
  telegram: {
    token: "8833457453:AAF46UCHKy5PdSN4m7EFnaDTtm02LoHGES4",
    chatId: "1081924516",
  },

  /* Firebase ixtiyoriy. cloud.js ichida to'ldiriladi */
  firebaseEnabled: false,

  songs: [
    {
      id: "perfect",
      title: "Meni sev",
      artist: "Shaxriyor",
      file: "/music/Shaxriyor-Meni-sev.mp3",
    },
    {
      id: "thousand",
      title: "Canım Sevgilim",
      artist: "Rei Ah",
      file: "/music/Rei-Ah-Canım-Sevgilim.mp3",
    },
    {
      id: "falling",
      title: "So'zlasa",
      artist: "Shuhrat Daryo",
      file: "/music/Shuhrat-Daryo-Sozlasa.mp3",
    },
    {
      id: "allofme",
      title: "18000 Olam",
      artist: "Sanjey",
      file: "/music/18000_olam.mp3",
    },
  ],

  hearts: [
    "Xullas ancha o'yladim. Aytmoqchi bo'ldim, keyinroqqa qoldirmoqchi bo'ldim. ancha o'yladim",
    "Keyin aytmasam kech bo'lib qolishini tushundim va shu saytni yozishga tushdim",
    "Balki sayt chiroyli bo'lmagandir. Muhimi bu emas...",
    "Sani o'qishingga halal bermay deb o'ylab yurgandim. qarasam kutsam o'xshamay qolishi mumkin ekan",
    "yakunida sanga shuni aytishga qaror qildim. Sani yoqtirib qoldim",
    "Tosatdan paydo bo'lib qolib bu gapni aytish g'alatidir lekin aytaman ...",
  ],

  days: [
    { id: "ertaga", label: "Ertaga", note: "Yurak kutolmayapti" },
    { id: "juma", label: "Juma kuni", note: "Sham yorug‘ida" },
    { id: "shanba", label: "Shanba kuni", note: "Sekin, bemalol" },
  ],

  places: [
    {
      id: "restoran",
      emoji: "🕯️",
      title: "Restoran",
      note: "Sham yorug‘ida suhbat",
    },
    {
      id: "kitob",
      emoji: "📖",
      title: "Kitob do‘koni",
      note: "mutola uchun ajoyib kitoblar olamiz",
    },
    {
      id: "park",
      emoji: "🌿",
      title: "Park",
      note: "Toza havoda, ajoyib atraksionlar bilan",
    },
  ],

  flowers: [
    {
      id: "qizil",
      emoji: "🌹",
      title: "Qizil atirgul",
      note: "Yagona gulga - yagona atirgul",
    },
    {
      id: "oq",
      emoji: "🤍",
      title: "Oq atirgul",
      note: "Yagona gulga - yagona atirgul",
    },
    {
      id: "binafsha",
      emoji: "💜",
      title: "Binafsha atirgul",
      note: "Yagona gulga - yagona atirgul",
    },
  ],
};

export default CONFIG;