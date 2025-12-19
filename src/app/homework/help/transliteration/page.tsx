'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Greek alphabet data
const alphabet = [
  { greek: 'Α α', name: 'Alpha', latin: 'a', example: 'ἀγάπη → agape' },
  { greek: 'Β β', name: 'Beta', latin: 'b', example: 'βασιλεία → basileia' },
  { greek: 'Γ γ', name: 'Gamma', latin: 'g', example: 'γῆ → ge' },
  { greek: 'Δ δ', name: 'Delta', latin: 'd', example: 'δόξα → doxa' },
  { greek: 'Ε ε', name: 'Epsilon', latin: 'e', example: 'ἐν → en' },
  { greek: 'Ζ ζ', name: 'Zeta', latin: 'z', example: 'ζωή → zoe' },
  { greek: 'Η η', name: 'Eta', latin: 'e (or ē)', example: 'ἡμέρα → hemera' },
  { greek: 'Θ θ', name: 'Theta', latin: 'th', example: 'θεός → theos' },
  { greek: 'Ι ι', name: 'Iota', latin: 'i', example: 'Ἰησοῦς → Iesous' },
  { greek: 'Κ κ', name: 'Kappa', latin: 'k', example: 'καί → kai' },
  { greek: 'Λ λ', name: 'Lambda', latin: 'l', example: 'λόγος → logos' },
  { greek: 'Μ μ', name: 'Mu', latin: 'm', example: 'μέγας → megas' },
  { greek: 'Ν ν', name: 'Nu', latin: 'n', example: 'νόμος → nomos' },
  { greek: 'Ξ ξ', name: 'Xi', latin: 'x', example: 'ξένος → xenos' },
  { greek: 'Ο ο', name: 'Omicron', latin: 'o', example: 'ὁδός → hodos' },
  { greek: 'Π π', name: 'Pi', latin: 'p', example: 'πᾶς → pas' },
  { greek: 'Ρ ρ', name: 'Rho', latin: 'r', example: 'ῥῆμα → rhema' },
  { greek: 'Σ σ/ς', name: 'Sigma', latin: 's', example: 'σάρξ → sarx' },
  { greek: 'Τ τ', name: 'Tau', latin: 't', example: 'τέκνον → teknon' },
  { greek: 'Υ υ', name: 'Upsilon', latin: 'u (or y)', example: 'υἱός → huios' },
  { greek: 'Φ φ', name: 'Phi', latin: 'ph', example: 'φῶς → phos' },
  { greek: 'Χ χ', name: 'Chi', latin: 'ch', example: 'Χριστός → Christos' },
  { greek: 'Ψ ψ', name: 'Psi', latin: 'ps', example: 'ψυχή → psyche' },
  { greek: 'Ω ω', name: 'Omega', latin: 'o (or ō)', example: 'ὥρα → hora' },
];

const diphthongs = [
  { greek: 'αι', latin: 'ai', example: 'καί → kai' },
  { greek: 'ει', latin: 'ei', example: 'εἰμί → eimi' },
  { greek: 'οι', latin: 'oi', example: 'οἶκος → oikos' },
  { greek: 'υι', latin: 'ui', example: 'υἱός → huios' },
  { greek: 'αυ', latin: 'au', example: 'αὐτός → autos' },
  { greek: 'ευ', latin: 'eu', example: 'εὐαγγέλιον → euangelion' },
  { greek: 'ηυ', latin: 'eu', example: 'ηὔξανεν → euxanen' },
  { greek: 'ου', latin: 'ou', example: 'οὐρανός → ouranos' },
];

export default function TransliterationHelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link
            href="/homework/hw1"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Homework</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Transliteration Guide</h1>
              <p className="text-muted-foreground">
                Convert Greek letters to Latin (English) characters
              </p>
            </div>
          </div>

          {/* Greek Alphabet Table */}
          <Card>
            <CardHeader>
              <CardTitle>The Greek Alphabet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Greek</th>
                      <th className="text-left py-2 px-3 font-medium">Name</th>
                      <th className="text-left py-2 px-3 font-medium">Latin</th>
                      <th className="text-left py-2 px-3 font-medium">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alphabet.map((letter, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 px-3 font-serif text-lg greek-text">
                          {letter.greek}
                        </td>
                        <td className="py-2 px-3">{letter.name}</td>
                        <td className="py-2 px-3 font-mono font-medium text-primary">
                          {letter.latin}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {letter.example}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Diphthongs */}
          <Card>
            <CardHeader>
              <CardTitle>Diphthongs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Two vowels pronounced together as one sound
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {diphthongs.map((d, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-serif greek-text">{d.greek}</p>
                    <p className="text-lg font-mono font-medium text-primary mt-1">
                      {d.latin}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.example}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breathing Marks */}
          <Card>
            <CardHeader>
              <CardTitle>Breathing Marks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Rough Breathing ( ʽ )</p>
                  <p className="text-3xl font-serif greek-text my-2">ἁ ἑ ἡ ἱ ὁ ὑ ὡ</p>
                  <p className="text-sm text-muted-foreground">
                    Add <span className="font-mono text-primary">h</span> before the vowel
                  </p>
                  <p className="text-sm mt-2">
                    Example: <span className="greek-text">ὁ</span> → <span className="font-mono">ho</span>
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium">Smooth Breathing ( ʼ )</p>
                  <p className="text-3xl font-serif greek-text my-2">ἀ ἐ ἠ ἰ ὀ ὐ ὠ</p>
                  <p className="text-sm text-muted-foreground">
                    No <span className="font-mono text-primary">h</span> is added
                  </p>
                  <p className="text-sm mt-2">
                    Example: <span className="greek-text">ἐν</span> → <span className="font-mono">en</span>
                  </p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium">Note on Rho (ρ)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Initial rho always has rough breathing: <span className="greek-text">ῥῆμα</span> → <span className="font-mono">rhema</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Ignore accents</strong> - The marks above vowels (ά, ὰ, ᾶ) don't change the transliteration
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Final sigma</strong> - ς and σ are both just <span className="font-mono">s</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Eta vs Epsilon</strong> - Both can be written as <span className="font-mono">e</span> in simple transliteration
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Omega vs Omicron</strong> - Both can be written as <span className="font-mono">o</span> in simple transliteration
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
