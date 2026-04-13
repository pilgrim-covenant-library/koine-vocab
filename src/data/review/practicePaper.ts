/**
 * Practice Paper — Mark 1 (Final Exam Format)
 * Section 1: Grammar MCQ (50 questions)
 * Section 2: Vocabulary MCQ (30 questions)
 * Section 3: Verse Analysis — matching + translation (5 Mark 1 verses)
 */

export interface PracticeMCQ {
  id: string;
  question: string;
  greek?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchingPair {
  greek: string;
  category: string;
}

export interface PracticeVerseAnalysis {
  id: string;
  reference: string;
  greek: string;
  transliteration: string;
  referenceTranslation: string;
  keyTerms: string[];
  matchingPairs: MatchingPair[];
  distractorCategories: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 1: Grammar MCQ — 50 questions from Mark 1
// ═══════════════════════════════════════════════════════════════════════════════

export const grammarQuestions: PracticeMCQ[] = [
  // --- Noun/Article Parsing ---
  { id: 'pp-g01', question: 'Parse Ἀρχή in Mark 1:1:', greek: 'Ἀρχὴ τοῦ εὐαγγελίου', options: ['Gen sg fem', 'Nom sg fem', 'Acc sg fem', 'Dat sg fem'], correctIndex: 1, explanation: 'Ἀρχή = nom sg fem: "beginning." Subject/title of the verse.' },
  { id: 'pp-g02', question: 'Parse τοῦ εὐαγγελίου in Mark 1:1:', greek: 'Ἀρχὴ τοῦ εὐαγγελίου', options: ['Nom sg neut', 'Gen sg neut', 'Dat sg neut', 'Acc sg neut'], correctIndex: 1, explanation: 'τοῦ εὐαγγελίου = gen sg neut: "of the gospel."' },
  { id: 'pp-g03', question: 'Parse υἱοῦ in Mark 1:1:', greek: 'υἱοῦ θεοῦ', options: ['Nom sg masc', 'Gen sg masc', 'Dat sg masc', 'Acc sg masc'], correctIndex: 1, explanation: 'υἱοῦ = gen sg masc: "of the Son." The -ου ending marks genitive.' },
  { id: 'pp-g04', question: 'Parse τῇ ἐρήμῳ in Mark 1:4:', greek: 'ἐν τῇ ἐρήμῳ', options: ['Nom sg fem', 'Gen sg fem', 'Dat sg fem', 'Acc sg fem'], correctIndex: 2, explanation: 'τῇ ἐρήμῳ = dat sg fem. After ἐν (always dative).' },
  { id: 'pp-g05', question: 'Parse βάπτισμα in Mark 1:4:', greek: 'κηρύσσων βάπτισμα μετανοίας', options: ['Nom sg neut', 'Gen sg neut', 'Dat sg neut', 'Acc sg neut'], correctIndex: 3, explanation: 'βάπτισμα = acc sg neut: "baptism." Direct object of κηρύσσων.' },
  { id: 'pp-g06', question: 'Parse μετανοίας in Mark 1:4:', greek: 'βάπτισμα μετανοίας', options: ['Nom sg fem', 'Gen sg fem', 'Dat sg fem', 'Acc sg fem'], correctIndex: 1, explanation: 'μετανοίας = gen sg fem: "of repentance." Describes what kind of baptism.' },
  { id: 'pp-g07', question: 'Parse ἁμαρτιῶν in Mark 1:4:', greek: 'εἰς ἄφεσιν ἁμαρτιῶν', options: ['Nom pl', 'Gen pl', 'Dat pl', 'Acc pl'], correctIndex: 1, explanation: 'ἁμαρτιῶν = gen pl fem: "of sins."' },
  { id: 'pp-g08', question: 'Parse τὸν ἱμάντα in Mark 1:7:', greek: 'λῦσαι τὸν ἱμάντα τῶν ὑποδημάτων', options: ['Nom sg masc', 'Gen sg masc', 'Dat sg masc', 'Acc sg masc'], correctIndex: 3, explanation: 'τὸν ἱμάντα = acc sg masc (3rd decl): "the strap." Direct object of λῦσαι.' },
  { id: 'pp-g09', question: 'Parse τῶν ὑποδημάτων in Mark 1:7:', greek: 'τῶν ὑποδημάτων αὐτοῦ', options: ['Nom pl neut', 'Gen pl neut', 'Dat pl neut', 'Acc pl neut'], correctIndex: 1, explanation: 'τῶν ὑποδημάτων = gen pl neut: "of the sandals."' },
  { id: 'pp-g10', question: 'Parse ὁ καιρός in Mark 1:15:', greek: 'πεπλήρωται ὁ καιρός', options: ['Nom sg masc', 'Gen sg masc', 'Dat sg masc', 'Acc sg masc'], correctIndex: 0, explanation: 'ὁ καιρός = nom sg masc: "the time." Subject of πεπλήρωται.' },

  // --- Pronoun Parsing ---
  { id: 'pp-g11', question: 'Parse αὐτοῦ in Mark 1:3:', greek: 'τὰς τρίβους αὐτοῦ', options: ['Masc nom sg', 'Masc gen sg', 'Masc dat sg', 'Masc acc sg'], correctIndex: 1, explanation: 'αὐτοῦ = gen sg masc: "his." Possessive genitive.' },
  { id: 'pp-g12', question: 'Parse μου in Mark 1:2:', greek: 'ἀποστέλλω τὸν ἄγγελόν μου', options: ['1st nom sg', '1st gen sg', '1st dat sg', '1st acc sg'], correctIndex: 1, explanation: 'μου = gen sg of ἐγώ: "my." Possessive genitive.' },
  { id: 'pp-g13', question: 'Parse σου in Mark 1:2:', greek: 'πρὸ προσώπου σου', options: ['2nd nom sg', '2nd gen sg', '2nd dat sg', '2nd acc sg'], correctIndex: 1, explanation: 'σου = gen sg of σύ: "your." After πρό (+ gen).' },
  { id: 'pp-g14', question: 'Parse ὑμᾶς in Mark 1:8:', greek: 'βαπτίσει ὑμᾶς ἐν πνεύματι', options: ['2nd nom pl', '2nd gen pl', '2nd dat pl', '2nd acc pl'], correctIndex: 3, explanation: 'ὑμᾶς = acc pl of σύ: "you all." Direct object.' },
  { id: 'pp-g15', question: 'Parse σοί in Mark 1:11:', greek: 'ἐν σοὶ εὐδόκησα', options: ['2nd nom sg', '2nd gen sg', '2nd dat sg', '2nd acc sg'], correctIndex: 2, explanation: 'σοί = dat sg of σύ: "in you." After ἐν (+ dative).' },
  { id: 'pp-g16', question: 'Parse αὐτοῖς in Mark 1:17:', greek: 'εἶπεν αὐτοῖς ὁ Ἰησοῦς', options: ['Masc gen pl', 'Masc dat pl', 'Masc acc pl', 'Masc nom pl'], correctIndex: 1, explanation: 'αὐτοῖς = dat pl masc: "to them." Indirect object.' },
  { id: 'pp-g17', question: 'Parse αὐτῷ in Mark 1:18:', greek: 'ἠκολούθησαν αὐτῷ', options: ['Masc nom sg', 'Masc gen sg', 'Masc dat sg', 'Masc acc sg'], correctIndex: 2, explanation: 'αὐτῷ = dat sg masc: "him." ἀκολουθέω takes dative.' },

  // --- Verb Parsing: Present/Imperfect ---
  { id: 'pp-g18', question: 'Parse ἔρχεται in Mark 1:7:', greek: 'ἔρχεται ὁ ἰσχυρότερός μου', options: ['Pres act ind 3rd sg', 'Pres mid/pass ind 3rd sg', 'Impf mid/pass ind 3rd sg', 'Aor mid ind 3rd sg'], correctIndex: 1, explanation: 'ἔρχεται = pres mid (deponent) of ἔρχομαι: "he comes."' },
  { id: 'pp-g19', question: 'Parse ἐκήρυσσεν in Mark 1:7:', greek: 'ἐκήρυσσεν λέγων', options: ['Pres act ind 3rd sg', 'Impf act ind 3rd sg', 'Aor act ind 3rd sg', 'Perf act ind 3rd sg'], correctIndex: 1, explanation: 'ἐ- (augment) + κηρυσσ- + εν = impf: "he was proclaiming."' },
  { id: 'pp-g20', question: 'Parse ἐξεπορεύετο in Mark 1:5:', greek: 'ἐξεπορεύετο πρὸς αὐτόν', options: ['Pres mid/pass 3rd sg', 'Impf mid/pass 3rd sg', 'Aor mid 3rd sg', 'Perf mid 3rd sg'], correctIndex: 1, explanation: 'ἐ- + ξεπορευ- + ετο = impf mid/pass: "was going out."' },
  { id: 'pp-g21', question: 'Parse ἐδίδασκεν in Mark 1:21:', greek: 'εἰσελθὼν εἰς τὴν συναγωγὴν ἐδίδασκεν', options: ['Pres act ind 3rd sg', 'Impf act ind 3rd sg', 'Aor act ind 3rd sg', 'Perf act ind 3rd sg'], correctIndex: 1, explanation: 'ἐ- + διδασκ- + εν = impf: "he was teaching."' },
  { id: 'pp-g22', question: 'Parse εἶ in Mark 1:11:', greek: 'σὺ εἶ ὁ υἱός μου', options: ['εἰμί pres 1st sg', 'εἰμί pres 2nd sg', 'εἰμί pres 3rd sg', 'εἰμί impf 2nd sg'], correctIndex: 1, explanation: 'εἶ = present of εἰμί, 2nd sg: "you are."' },

  // --- Verb Parsing: Aorist ---
  { id: 'pp-g23', question: 'Parse ἐγένετο in Mark 1:4:', greek: 'ἐγένετο Ἰωάννης ὁ βαπτίζων', options: ['Pres mid/pass 3rd sg', 'Impf mid/pass 3rd sg', 'Aor mid 3rd sg', 'Perf mid 3rd sg'], correctIndex: 2, explanation: 'ἐγένετο = aor mid (deponent) of γίνομαι: "appeared."' },
  { id: 'pp-g24', question: 'Parse ἐβάπτισα in Mark 1:8:', greek: 'ἐγὼ ἐβάπτισα ὑμᾶς ὕδατι', options: ['Pres 1st sg', 'Impf 1st sg', '1st Aor act ind 1st sg', 'Perf 1st sg'], correctIndex: 2, explanation: 'ἐ- + βαπτισ- + α = 1st aorist: "I baptized."' },
  { id: 'pp-g25', question: 'Parse ἦλθεν in Mark 1:9:', greek: 'ἦλθεν Ἰησοῦς ἀπὸ Ναζαρέτ', options: ['Pres 3rd sg', 'Impf 3rd sg', '2nd Aor act ind 3rd sg', 'Perf 3rd sg'], correctIndex: 2, explanation: 'ἦλθεν = 2nd aor of ἔρχομαι: "he came." Stem ελθ-.' },
  { id: 'pp-g26', question: 'Parse εἶδεν in Mark 1:10:', greek: 'εἶδεν σχιζομένους τοὺς οὐρανούς', options: ['Pres 3rd sg', 'Impf 3rd sg', '2nd Aor act ind 3rd sg', 'Perf 3rd sg'], correctIndex: 2, explanation: 'εἶδεν = 2nd aor of ὁράω: "he saw." Stem ἰδ-.' },
  { id: 'pp-g27', question: 'Parse εὐδόκησα in Mark 1:11:', greek: 'ἐν σοὶ εὐδόκησα', options: ['Pres 1st sg', 'Impf 1st sg', '1st Aor act ind 1st sg', 'Perf 1st sg'], correctIndex: 2, explanation: 'εὐδοκη- + σα = 1st aor: "I am well pleased."' },
  { id: 'pp-g28', question: 'Parse εἶπεν in Mark 1:17:', greek: 'εἶπεν αὐτοῖς ὁ Ἰησοῦς', options: ['Pres 3rd sg', 'Impf 3rd sg', '2nd Aor act ind 3rd sg', 'Perf 3rd sg'], correctIndex: 2, explanation: 'εἶπεν = 2nd aor of λέγω: "he said." Stem εἰπ-.' },
  { id: 'pp-g29', question: 'Parse ἠκολούθησαν in Mark 1:18:', greek: 'ἀφέντες τὰ δίκτυα ἠκολούθησαν αὐτῷ', options: ['Pres 3rd pl', 'Impf 3rd pl', '1st Aor act ind 3rd pl', 'Perf 3rd pl'], correctIndex: 2, explanation: 'ἠ- + κολουθη- + σα + ν = 1st aor: "they followed."' },
  { id: 'pp-g30', question: 'Parse ἐξῆλθεν in Mark 1:35:', greek: 'ἀναστὰς ἐξῆλθεν', options: ['Pres 3rd sg', 'Impf 3rd sg', '2nd Aor act ind 3rd sg', 'Perf 3rd sg'], correctIndex: 2, explanation: 'ἐξῆλθεν = 2nd aor of ἐξέρχομαι: "he went out." Stem ελθ-.' },

  // --- Verb Parsing: Future ---
  { id: 'pp-g31', question: 'Parse βαπτίσει in Mark 1:8:', greek: 'αὐτὸς δὲ βαπτίσει ὑμᾶς', options: ['Pres act ind 3rd sg', 'Fut act ind 3rd sg', 'Aor act ind 3rd sg', 'Perf act ind 3rd sg'], correctIndex: 1, explanation: 'βαπτίσ- + ει: σ between stem and ending = future.' },
  { id: 'pp-g32', question: 'Parse ποιήσω in Mark 1:17:', greek: 'ποιήσω ὑμᾶς γενέσθαι ἁλιεῖς', options: ['Pres 1st sg', 'Fut act ind 1st sg', 'Aor subj 1st sg', 'Pres subj 1st sg'], correctIndex: 1, explanation: 'ποιη- + σ + ω = future: "I will make."' },
  { id: 'pp-g33', question: 'Parse κατασκευάσει in Mark 1:2:', greek: 'ὃς κατασκευάσει τὴν ὁδόν σου', options: ['Pres 3rd sg', 'Fut act ind 3rd sg', 'Aor 3rd sg', 'Perf 3rd sg'], correctIndex: 1, explanation: 'κατασκευά- + σ + ει = future: "who will prepare."' },

  // --- Verb Parsing: Perfect ---
  { id: 'pp-g34', question: 'Parse γέγραπται in Mark 1:2:', greek: 'Καθὼς γέγραπται', options: ['Aor pass 3rd sg', 'Pres pass 3rd sg', 'Perf pass ind 3rd sg', 'Impf mid/pass 3rd sg'], correctIndex: 2, explanation: 'γε- (reduplication) + γραπ- + ται = perf pass: "it has been written."' },
  { id: 'pp-g35', question: 'Parse πεπλήρωται in Mark 1:15:', greek: 'πεπλήρωται ὁ καιρός', options: ['Aor pass 3rd sg', 'Pres pass 3rd sg', 'Perf pass ind 3rd sg', 'Fut pass 3rd sg'], correctIndex: 2, explanation: 'πε- (reduplication) + πληρω- + ται = perf pass: "has been fulfilled."' },
  { id: 'pp-g36', question: 'Parse ἤγγικεν in Mark 1:15:', greek: 'ἤγγικεν ἡ βασιλεία τοῦ θεοῦ', options: ['Aor act 3rd sg', 'Impf act 3rd sg', 'Perf act ind 3rd sg', 'Pres act 3rd sg'], correctIndex: 2, explanation: 'ἤγγικεν = perf act of ἐγγίζω: "has drawn near."' },

  // --- Verb Parsing: Passive ---
  { id: 'pp-g37', question: 'Parse ἐβαπτίσθη in Mark 1:9:', greek: 'ἐβαπτίσθη εἰς τὸν Ἰορδάνην', options: ['Aor act ind 3rd sg', 'Aor mid ind 3rd sg', 'Aor pass ind 3rd sg', 'Impf mid/pass ind 3rd sg'], correctIndex: 2, explanation: 'ἐ- + βαπτισ- + θη = aor pass: "he was baptized." -θη = aorist passive.' },
  { id: 'pp-g38', question: 'Parse ἐβαπτίζοντο in Mark 1:5:', greek: 'ἐβαπτίζοντο ὑπʼ αὐτοῦ', options: ['Pres mid/pass 3rd pl', 'Impf mid/pass 3rd pl', 'Aor pass 3rd pl', 'Perf pass 3rd pl'], correctIndex: 1, explanation: 'ἐ- + βαπτιζ- + οντο = impf mid/pass: "they were being baptized."' },
  { id: 'pp-g39', question: 'Parse ἐκαθαρίσθη in Mark 1:42:', greek: 'ἀπῆλθεν ἡ λέπρα, καὶ ἐκαθαρίσθη', options: ['Aor act 3rd sg', 'Aor mid 3rd sg', 'Aor pass ind 3rd sg', 'Impf mid/pass 3rd sg'], correctIndex: 2, explanation: 'ἐ- + καθαρισ- + θη = aor pass: "he was cleansed."' },

  // --- Verb Parsing: Imperative ---
  { id: 'pp-g40', question: 'Parse μετανοεῖτε in Mark 1:15:', greek: 'μετανοεῖτε καὶ πιστεύετε', options: ['Pres act ind 2nd pl', 'Pres act imp 2nd pl', 'Aor act imp 2nd pl', 'Pres act subj 2nd pl'], correctIndex: 1, explanation: 'Present active imperative 2nd pl: "Repent!"' },
  { id: 'pp-g41', question: 'Parse ἑτοιμάσατε in Mark 1:3:', greek: 'ἑτοιμάσατε τὴν ὁδὸν κυρίου', options: ['Pres act imp 2nd pl', 'Aor act imp 2nd pl', 'Pres act ind 2nd pl', 'Aor act ind 2nd pl'], correctIndex: 1, explanation: 'ἑτοιμάσατε = aor act imp 2nd pl: "Prepare!"' },
  { id: 'pp-g42', question: 'Parse καθαρίσθητι in Mark 1:41:', greek: 'θέλω, καθαρίσθητι', options: ['Aor act imp 2nd sg', 'Aor pass imp 2nd sg', 'Pres pass imp 2nd sg', 'Aor pass ind 2nd sg'], correctIndex: 1, explanation: 'καθαρισ- + θη + τι = aor pass imp: "Be cleansed!"' },

  // --- Verb Parsing: Subjunctive ---
  { id: 'pp-g43', question: 'Parse θέλῃς in Mark 1:40:', greek: 'ἐὰν θέλῃς δύνασαί με καθαρίσαι', options: ['Pres act ind 2nd sg', 'Pres act subj 2nd sg', 'Aor act subj 2nd sg', 'Pres act imp 2nd sg'], correctIndex: 1, explanation: 'θέλ- + ῃς (long vowel) = pres subj. After ἐάν = conditional.' },
  { id: 'pp-g44', question: 'Parse κηρύξω in Mark 1:38:', greek: 'ἵνα καὶ ἐκεῖ κηρύξω', options: ['Fut act ind 1st sg', 'Aor act subj 1st sg', 'Pres act subj 1st sg', 'Aor act ind 1st sg'], correctIndex: 1, explanation: 'After ἵνα = subjunctive. κηρυξ- + ω (no augment) = aor subj.' },

  // --- Participle Parsing ---
  { id: 'pp-g45', question: 'Parse κηρύσσων in Mark 1:14:', greek: 'ἦλθεν ὁ Ἰησοῦς... κηρύσσων τὸ εὐαγγέλιον', options: ['Pres act ind 1st sg', 'Pres act ptcpl masc nom sg', 'Aor act ptcpl masc nom sg', 'Pres pass ptcpl masc nom sg'], correctIndex: 1, explanation: 'κηρύσσων = pres act ptcpl masc nom sg: "proclaiming."' },
  { id: 'pp-g46', question: 'Parse ἀναβαίνων in Mark 1:10:', greek: 'εὐθὺς ἀναβαίνων ἐκ τοῦ ὕδατος', options: ['Pres act ptcpl masc nom sg', 'Aor act ptcpl masc nom sg', 'Pres act ind 1st sg', 'Aor pass ptcpl masc nom sg'], correctIndex: 0, explanation: 'ἀναβαίνων = pres act ptcpl: "going up."' },
  { id: 'pp-g47', question: 'Parse εἰσελθών in Mark 1:21:', greek: 'εἰσελθὼν εἰς τὴν συναγωγήν', options: ['Pres act ptcpl', '2nd Aor act ptcpl masc nom sg', '1st Aor act ptcpl', 'Perf act ptcpl'], correctIndex: 1, explanation: 'εἰσελθών = 2nd aor ptcpl of εἰσέρχομαι: "having entered."' },
  { id: 'pp-g48', question: 'Parse ἀφέντες in Mark 1:18:', greek: 'ἀφέντες τὰ δίκτυα ἠκολούθησαν', options: ['Pres act ptcpl masc nom pl', '2nd Aor act ptcpl masc nom pl', '1st Aor act ptcpl masc nom pl', 'Perf act ptcpl masc nom pl'], correctIndex: 1, explanation: 'ἀφέντες = 2nd aor ptcpl of ἀφίημι: "having left."' },

  // --- Infinitive Parsing ---
  { id: 'pp-g49', question: 'Parse λῦσαι in Mark 1:7:', greek: 'κύψας λῦσαι τὸν ἱμάντα', options: ['Pres act inf', 'Aor act inf', 'Perf act inf', 'Aor pass inf'], correctIndex: 1, explanation: 'λῦ- + σαι = aor act inf: "to untie."' },
  { id: 'pp-g50', question: 'Parse καθαρίσαι in Mark 1:40:', greek: 'δύνασαί με καθαρίσαι', options: ['Pres act inf', 'Aor act inf', 'Perf act inf', 'Aor pass inf'], correctIndex: 1, explanation: 'καθαρισ- + αι = aor act inf: "to cleanse."' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Section 2: Vocabulary MCQ — 30 questions from Mark 1
// ═══════════════════════════════════════════════════════════════════════════════

export const vocabQuestions: PracticeMCQ[] = [
  { id: 'pp-v01', question: 'What does σπλαγχνίζομαι mean?', greek: 'Mark 1:41', options: ['I am angry', 'I have compassion, I am moved with pity', 'I am amazed', 'I am afraid'], correctIndex: 1, explanation: 'σπλαγχνίζομαι = "I have compassion, I am moved with pity." Deponent verb from σπλάγχνα (intestines/bowels), expressing deep gut-level emotion.' },
  { id: 'pp-v02', question: 'What does ἐμβριμάομαι mean?', greek: 'Mark 1:43', options: ['I rebuke', 'I bless', 'I sternly warn, I am deeply moved', 'I comfort'], correctIndex: 2, explanation: 'ἐμβριμάομαι = "I sternly warn, I am deeply moved." Rare deponent verb expressing strong emotion or stern admonition.' },
  { id: 'pp-v03', question: 'What does ὁδός mean?', greek: 'Mark 1:2-3', options: ['temple', 'way, road, path', 'voice', 'word'], correctIndex: 1, explanation: 'ὁδός = "way, road, path."' },
  { id: 'pp-v04', question: 'What does φιμόω mean?', greek: 'Mark 1:25', options: ['I silence, muzzle', 'I speak', 'I shout', 'I listen'], correctIndex: 0, explanation: 'φιμόω = "I silence, muzzle." Literally "to muzzle"; used by Jesus to silence the unclean spirit.' },
  { id: 'pp-v05', question: 'What does ἔρημος mean?', greek: 'Mark 1:4', options: ['temple', 'mountain', 'wilderness, desert', 'river'], correctIndex: 2, explanation: 'ἔρημος = "wilderness, desert."' },
  { id: 'pp-v06', question: 'What does κηρύσσω mean?', greek: 'Mark 1:4', options: ['I baptize', 'I preach, proclaim', 'I teach', 'I pray'], correctIndex: 1, explanation: 'κηρύσσω = "I preach, proclaim."' },
  { id: 'pp-v07', question: 'What does μετάνοια mean?', greek: 'Mark 1:4', options: ['forgiveness', 'faith', 'repentance', 'salvation'], correctIndex: 2, explanation: 'μετάνοια = "repentance, change of mind."' },
  { id: 'pp-v08', question: 'What does σπαράσσω mean?', greek: 'Mark 1:26', options: ['I heal', 'I strike', 'I convulse, tear', 'I bind'], correctIndex: 2, explanation: 'σπαράσσω = "I convulse, tear." Used of the unclean spirit\'s violent exit from the possessed man.' },
  { id: 'pp-v09', question: 'What does ἄφεσις mean?', greek: 'Mark 1:4', options: ['repentance', 'judgment', 'forgiveness, release', 'salvation'], correctIndex: 2, explanation: 'ἄφεσις = "forgiveness, release."' },
  { id: 'pp-v10', question: 'What does ἐπιτιμάω mean?', greek: 'Mark 1:25', options: ['I command', 'I praise', 'I encourage', 'I rebuke, warn sternly'], correctIndex: 3, explanation: 'ἐπιτιμάω = "I rebuke, warn sternly." Used of Jesus rebuking demons and silencing them.' },
  { id: 'pp-v11', question: 'What does ἐκπλήσσω mean?', greek: 'Mark 1:22', options: ['I am afraid', 'I rejoice', 'I am amazed, astonished', 'I am angry'], correctIndex: 2, explanation: 'ἐκπλήσσω = "I am amazed, astonished." Passive: "to be struck out of one\'s senses." Describes the crowd\'s reaction to Jesus\' authoritative teaching.' },
  { id: 'pp-v12', question: 'What does ἐπιτάσσω mean?', greek: 'Mark 1:27', options: ['I ask', 'I command, order', 'I permit', 'I forbid'], correctIndex: 1, explanation: 'ἐπιτάσσω = "I command, order." The crowd marvels that Jesus commands (ἐπιτάσσει) even the unclean spirits and they obey.' },
  { id: 'pp-v13', question: 'What does ὑπακούω mean?', greek: 'Mark 1:27', options: ['I disobey', 'I hear', 'I obey, submit to', 'I answer'], correctIndex: 2, explanation: 'ὑπακούω = "I obey, submit to." Compound of ὑπό + ἀκούω ("hear under" = obey). The unclean spirits obey Jesus\' authority.' },
  { id: 'pp-v14', question: 'What does καιρός mean?', greek: 'Mark 1:15', options: ['place', 'appointed time, season', 'word', 'kingdom'], correctIndex: 1, explanation: 'καιρός = "appointed time, season."' },
  { id: 'pp-v15', question: 'What does πειράζω mean?', greek: 'Mark 1:13', options: ['I tempt, test', 'I trust', 'I prove', 'I judge'], correctIndex: 0, explanation: 'πειράζω = "I tempt, test, try." Satan tempted (πειραζόμενος, present passive participle) Jesus in the wilderness for forty days.' },
  { id: 'pp-v16', question: 'What does ἀκάθαρτος mean?', greek: 'Mark 1:23, 26, 27', options: ['holy', 'righteous', 'unclean, impure', 'sinful'], correctIndex: 2, explanation: 'ἀκάθαρτος = "unclean, impure." Compound: ἀ- (not) + καθαρός (clean). Used repeatedly in Mark 1 for πνεῦμα ἀκάθαρτον (unclean spirit).' },
  { id: 'pp-v17', question: 'What does λεπρός mean?', greek: 'Mark 1:40', options: ['blind person', 'leper, leprous person', 'deaf person', 'lame person'], correctIndex: 1, explanation: 'λεπρός = "leper, leprous person." A person with a skin disease rendering them ceremonially unclean.' },
  { id: 'pp-v18', question: 'What does ἀκολουθέω mean?', greek: 'Mark 1:18', options: ['I leave', 'I follow', 'I see', 'I call'], correctIndex: 1, explanation: 'ἀκολουθέω = "I follow." Takes dative.' },
  { id: 'pp-v19', question: 'What does συναγωγή mean?', greek: 'Mark 1:21', options: ['temple', 'synagogue', 'marketplace', 'house'], correctIndex: 1, explanation: 'συναγωγή = "synagogue."' },
  { id: 'pp-v20', question: 'What does ἐκβάλλω mean?', greek: 'Mark 1:12, 34, 43', options: ['I send out', 'I bring in', 'I cast out, drive out', 'I shut out'], correctIndex: 2, explanation: 'ἐκβάλλω = "I cast out, drive out." Compound: ἐκ (out) + βάλλω (throw). Used for the Spirit driving Jesus into the wilderness and for casting out demons.' },
  { id: 'pp-v21', question: 'What does ἐξουσία mean?', greek: 'Mark 1:22', options: ['power', 'authority, right', 'wisdom', 'glory'], correctIndex: 1, explanation: 'ἐξουσία = "authority, right."' },
  { id: 'pp-v22', question: 'What does διδαχή mean?', greek: 'Mark 1:22', options: ['baptism', 'teaching', 'preaching', 'miracle'], correctIndex: 1, explanation: 'διδαχή = "teaching, doctrine."' },
  { id: 'pp-v23', question: 'What does εὐθύς mean?', greek: 'Mark 1 (11 times)', options: ['slowly', 'immediately, at once', 'quietly', 'finally'], correctIndex: 1, explanation: 'εὐθύς = "immediately." Mark\'s signature word.' },
  { id: 'pp-v24', question: 'What does δύναμαι mean?', greek: 'Mark 1:40', options: ['I want', 'I am able, I can', 'I command', 'I believe'], correctIndex: 1, explanation: 'δύναμαι = "I am able, I can." Deponent.' },
  { id: 'pp-v25', question: 'What does ἅπτομαι mean?', greek: 'Mark 1:41', options: ['I see', 'I touch, take hold of', 'I heal', 'I reach'], correctIndex: 1, explanation: 'ἅπτομαι = "I touch, take hold of." Middle deponent; takes the genitive. Jesus touched the leper — a shocking act of ritual boundary-crossing.' },
  { id: 'pp-v26', question: 'What does χείρ mean?', greek: 'Mark 1:41', options: ['foot', 'hand', 'head', 'eye'], correctIndex: 1, explanation: 'χείρ = "hand." 3rd decl fem.' },
  { id: 'pp-v27', question: 'What does ἐκτείνω mean?', greek: 'Mark 1:41', options: ['I stretch out, extend', 'I pull back', 'I lift up', 'I lay down'], correctIndex: 0, explanation: 'ἐκτείνω = "I stretch out, extend." Compound: ἐκ + τείνω. Jesus stretched out (ἐκτείνας, aorist participle) his hand to touch the leper.' },
  { id: 'pp-v28', question: 'What does καθαρίζω mean?', greek: 'Mark 1:40-42', options: ['I wash', 'I heal', 'I cleanse, make clean', 'I sanctify'], correctIndex: 2, explanation: 'καθαρίζω = "I cleanse, make clean." Related to καθαρός (clean). The leper asks Jesus "if you are willing, you can cleanse (καθαρίσαι) me."' },
  { id: 'pp-v29', question: 'What does ἀποστέλλω mean?', greek: 'Mark 1:2', options: ['I receive', 'I send', 'I baptize', 'I teach'], correctIndex: 1, explanation: 'ἀποστέλλω = "I send." Root of ἀπόστολος.' },
  { id: 'pp-v30', question: 'What does ἱερεύς mean?', greek: 'Mark 1:44', options: ['scribe', 'priest', 'elder', 'Pharisee'], correctIndex: 1, explanation: 'ἱερεύς = "priest." 3rd decl masc.' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Section 3: Verse Analysis — 5 Mark 1 verses (matching + translation)
// ═══════════════════════════════════════════════════════════════════════════════

export const verseAnalysisQuestions: PracticeVerseAnalysis[] = [
  {
    id: 'pp-va01',
    reference: 'Mark 1:1',
    greek: 'Ἀρχὴ τοῦ εὐαγγελίου Ἰησοῦ Χριστοῦ υἱοῦ θεοῦ.',
    transliteration: 'Archē tou euangeliou Iēsou Christou huiou theou.',
    referenceTranslation: 'The beginning of the gospel of Jesus Christ, the Son of God.',
    keyTerms: ['beginning', 'gospel', 'Jesus', 'Christ', 'Son', 'God'],
    matchingPairs: [
      { greek: 'Ἀρχή', category: 'Nominative singular feminine noun' },
      { greek: 'τοῦ εὐαγγελίου', category: 'Genitive singular neuter noun with article' },
      { greek: 'Ἰησοῦ Χριστοῦ', category: 'Genitive singular proper nouns' },
      { greek: 'υἱοῦ', category: 'Genitive singular masculine noun' },
      { greek: 'θεοῦ', category: 'Genitive singular masculine noun' },
    ],
    distractorCategories: ['Dative singular feminine noun', 'Accusative singular neuter noun', 'Nominative plural masculine noun'],
  },
  {
    id: 'pp-va02',
    reference: 'Mark 1:25',
    greek: 'καὶ ἐπετίμησεν αὐτῷ ὁ Ἰησοῦς λέγων· φιμώθητι καὶ ἔξελθε ἐξ αὐτοῦ.',
    transliteration: 'kai epetimēsen autō ho Iēsous legōn; phimōthēti kai exelthe ex autou.',
    referenceTranslation: 'And Jesus rebuked him, saying, "Be silent, and come out of him!"',
    keyTerms: ['rebuked', 'saying', 'silent', 'come out'],
    matchingPairs: [
      { greek: 'ἐπετίμησεν', category: 'Aorist active indicative verb' },
      { greek: 'αὐτῷ', category: 'Dative singular masculine pronoun' },
      { greek: 'ὁ Ἰησοῦς', category: 'Nominative singular proper noun with article' },
      { greek: 'λέγων', category: 'Present active participle' },
      { greek: 'φιμώθητι', category: 'Aorist passive imperative verb' },
      { greek: 'ἔξελθε', category: '2nd aorist active imperative verb' },
      { greek: 'ἐξ αὐτοῦ', category: 'Preposition + genitive pronoun' },
    ],
    distractorCategories: ['Perfect active indicative verb', 'Accusative plural feminine noun', 'Present middle indicative verb'],
  },
  {
    id: 'pp-va03',
    reference: 'Mark 1:11',
    greek: 'σὺ εἶ ὁ υἱός μου ὁ ἀγαπητός, ἐν σοὶ εὐδόκησα.',
    transliteration: 'sy ei ho huios mou ho agapētos, en soi eudokēsa.',
    referenceTranslation: 'You are my beloved Son; with you I am well pleased.',
    keyTerms: ['you', 'are', 'Son', 'beloved', 'pleased'],
    matchingPairs: [
      { greek: 'σύ', category: '2nd person personal pronoun nominative' },
      { greek: 'εἶ', category: 'Present indicative verb of εἰμί' },
      { greek: 'ὁ υἱός', category: 'Nominative singular masculine noun with article' },
      { greek: 'μου', category: '1st person personal pronoun genitive' },
      { greek: 'ὁ ἀγαπητός', category: 'Nominative singular masculine adjective with article' },
      { greek: 'ἐν σοί', category: 'Preposition + dative pronoun' },
      { greek: 'εὐδόκησα', category: 'Aorist active indicative verb' },
    ],
    distractorCategories: ['Accusative singular feminine noun', 'Perfect passive indicative verb', 'Present active participle'],
  },
  {
    id: 'pp-va04',
    reference: 'Mark 1:41',
    greek: 'καὶ σπλαγχνισθεὶς ἐκτείνας τὴν χεῖρα αὐτοῦ ἥψατο καὶ λέγει αὐτῷ· θέλω, καθαρίσθητι.',
    transliteration: 'kai splanchnistheis ekteinas tēn cheira autou hēpsato kai legei autō; thelō, katharisthēti.',
    referenceTranslation: 'Moved with compassion, he stretched out his hand and touched him, and said to him, "I am willing; be cleansed."',
    keyTerms: ['compassion', 'stretched out', 'hand', 'touched', 'willing', 'cleansed'],
    matchingPairs: [
      { greek: 'σπλαγχνισθείς', category: 'Aorist passive participle (deponent)' },
      { greek: 'ἐκτείνας', category: 'Aorist active participle' },
      { greek: 'τὴν χεῖρα', category: 'Accusative singular feminine noun with article' },
      { greek: 'ἥψατο', category: 'Aorist middle indicative verb' },
      { greek: 'λέγει', category: 'Present active indicative verb (historical present)' },
      { greek: 'θέλω', category: 'Present active indicative verb' },
      { greek: 'καθαρίσθητι', category: 'Aorist passive imperative verb' },
    ],
    distractorCategories: ['Perfect passive indicative verb', 'Nominative plural neuter noun', 'Future active indicative verb'],
  },
  {
    id: 'pp-va05',
    reference: 'Mark 1:17',
    greek: 'δεῦτε ὀπίσω μου, καὶ ποιήσω ὑμᾶς γενέσθαι ἁλιεῖς ἀνθρώπων.',
    transliteration: 'deute opisō mou, kai poiēsō hymas genesthai halieis anthrōpōn.',
    referenceTranslation: 'Follow me, and I will make you become fishers of men.',
    keyTerms: ['follow', 'make', 'become', 'fishers', 'men'],
    matchingPairs: [
      { greek: 'δεῦτε', category: 'Imperative adverb' },
      { greek: 'ὀπίσω μου', category: 'Adverb + genitive pronoun' },
      { greek: 'ποιήσω', category: 'Future active indicative verb' },
      { greek: 'ὑμᾶς', category: '2nd person accusative plural pronoun' },
      { greek: 'γενέσθαι', category: '2nd Aorist middle infinitive' },
      { greek: 'ἁλιεῖς', category: 'Accusative plural masculine noun' },
      { greek: 'ἀνθρώπων', category: 'Genitive plural masculine noun' },
    ],
    distractorCategories: ['Present active indicative verb', 'Dative singular masculine noun', 'Nominative singular feminine noun'],
  },
];

export const PRACTICE_PAPER_SECTIONS = [
  { id: 1, title: 'Grammar', questionCount: grammarQuestions.length, description: 'Parse verb forms, identify cases, tenses, voices, and moods' },
  { id: 2, title: 'Vocabulary', questionCount: vocabQuestions.length, description: 'Identify the meaning of Greek words from Mark 1' },
  { id: 3, title: 'Verse Analysis', questionCount: verseAnalysisQuestions.length, description: 'Match Greek words to categories and translate' },
] as const;
