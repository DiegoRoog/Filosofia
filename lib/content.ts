export type StoryBlock = { label: string; title: string; highlight: string; text: string; top: number };
export const headBlocks: StoryBlock[] = [
  { label: 'I · LEVEZA', title: 'A vida pesa menos para quem aprende a olhar.', highlight: 'olhar', text: 'Os gregos não buscavam respostas prontas. Buscavam a clareza de quem se permite perguntar.', top: 54 },
  { label: 'II · MEDIDA', title: 'Nem tudo está em teu poder.', highlight: 'poder', text: 'Separar o que depende de ti do que não depende é o primeiro passo para caminhar sem peso.', top: 96 },
  { label: 'III · MÁSCARA', title: 'O ouro é só a superfície.', highlight: 'superfície', text: 'Por baixo do brilho existe o que somos de verdade. É ali que o pensamento começa.', top: 150 },
  { label: 'IV · FINITUDE', title: 'Lembra-te: tudo passa.', highlight: 'passa', text: 'Saber que o tempo é breve não entristece. Faz de cada manhã uma pequena oferenda.', top: 192 },
  { label: 'V · PRESENÇA', title: 'Viver bem é viver desperto.', highlight: 'desperto', text: 'Menos pressa, mais atenção. A leveza nasce de estar inteiro onde se está.', top: 246 },
  { label: 'VI · TRAVESSIA', title: 'Agora, conheça quem pensou tudo isso.', highlight: 'pensou', text: 'Role para encontrar três mestres.', top: 300 },
];
export const crownBlocks: StoryBlock[] = [
  { label: 'EPÍLOGO · O VAZIO', title: 'Antes da coroa, houve a pergunta.', highlight: 'pergunta', text: 'Todo caminho começa num lugar vazio, esperando que alguém tenha coragem de pensar.', top: 71 },
  { label: 'I · ARETÉ', title: 'Os gregos chamavam de areté a busca pela excelência.', highlight: 'excelência', text: 'Não é um destino. É a prática diária de agir com clareza, coragem e medida.', top: 146 },
  { label: 'II · LOUROS', title: 'A coroa de louros nunca foi um presente.', highlight: 'presente', text: 'Era o prêmio de quem insistiu em pensar, tentar e recomeçar quando ninguém estava olhando.', top: 226 },
  { label: 'III · LUZ', title: 'A luz só encontra quem olha para cima.', highlight: 'olha', text: 'Sabedoria não se herda do templo. Cada geração a reconquista com as próprias perguntas.', top: 306 },
  { label: 'IV · COROA', title: 'Ela está onde sempre esteve.', highlight: 'sempre', text: 'No centro de uma vida examinada. Nem na pedra, nem no passado: na próxima pergunta que você ousar fazer.', top: 396 },
  { label: 'FILOSOFIA', title: 'Continue perguntando.', highlight: 'perguntando', text: 'Três questões ainda valem uma vida: quem sou, o que é viver bem e o que devo aos outros.', top: 486 },
];
export const philosophers = [
  { name: 'Aristóteles', slug: 'aristoteles', label: '01 / 03 · LICEU', dates: '384 — 322 a.C.', text: 'Discípulo de Platão e mestre de Alexandre, o Grande. Pai da lógica, defendia que a felicidade nasce de uma vida guiada pela virtude e pela razão.', tags: ['LÓGICA', 'ÉTICA', 'POLÍTICA'] },
  { name: 'Platão', slug: 'platao', label: '02 / 03 · ACADEMIA', dates: 'c. 428 — 348 a.C.', text: 'Discípulo de Sócrates e fundador da Academia de Atenas. Sua teoria das Ideias diz que o mundo visível é apenas sombra de uma realidade mais verdadeira.', tags: ['IDEIAS', 'JUSTIÇA', 'ALMA'] },
  { name: 'Sócrates', slug: 'socrates', label: '03 / 03 · ÁGORA', dates: 'c. 470 — 399 a.C.', text: 'Nada escreveu, mas transformou Atenas com perguntas. Seu método, o diálogo, busca a verdade pela dúvida e pelo autoconhecimento.', tags: ['DIÁLOGO', 'VIRTUDE', 'AUTOCONHECIMENTO'] },
];
