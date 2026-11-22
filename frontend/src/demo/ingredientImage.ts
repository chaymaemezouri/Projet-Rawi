const RULES: [RegExp, string][] = [
  [/khol|kohl/i, "/images/ing-khol.jpg"],
  [/eau de rose|pétales de rose|\brose\b/i, "/images/ing-rose.jpg"],
  [/fleur d'oranger|oranger|bigaradier|zeste/i, "/images/ing-oranger.jpg"],
  [/ghassoul|argile|rhassoul/i, "/images/ing-ghassoul.jpg"],
  [/miel/i, "/images/ing-miel.jpg"],
  [/argan/i, "/images/ing-argan.jpg"],
  [/henn|pâte|pate/i, "/images/ing-henne.jpg"],
  [/amande/i, "/images/ing-amande.jpg"],
  [/safran/i, "/images/ing-safran.jpg"],
  [/olive/i, "/images/ing-olive.jpg"],
  [/nigelle/i, "/images/ing-nigelle.jpg"],
  [/sidr|jujub/i, "/images/ing-sidr.jpg"],
  [/savon|beldi/i, "/images/ing-savon.jpg"],
  [/encens|luban|bakhour|myrrhe|benjoin|\boud\b/i, "/images/ing-encens.jpg"],
  [/menthe/i, "/images/ing-menthe.jpg"],
  [/lait/i, "/images/ing-lait.jpg"],
  [/œuf|oeuf|jaune d/i, "/images/ing-oeuf.jpg"],
  [/camomille/i, "/images/ing-camomille.jpg"],
  [/sucre/i, "/images/ing-sucre.jpg"],
  [/sésame|sesame/i, "/images/ing-sesame.jpg"],
  [/karit/i, "/images/ing-karite.jpg"],
  [/lavande/i, "/images/ing-lavande.jpg"],
  [/citron/i, "/images/ing-citron.jpg"],
  [/eau/i, "/images/ing-eau.jpg"],
  [/linge|coton|tissu/i, "/images/rawi-linen.jpg"],
];

export function ingredientImage(name: string) {
  const found = RULES.find(([pattern]) => pattern.test(name));
  return found ? found[1] : "/images/rawi-botanical.jpg";
}
