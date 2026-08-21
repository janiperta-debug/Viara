-- Migraatio: laajennetaan tapahtumat INSERT -policy koskemaan
-- myös tyonjohto- ja admin-rooleja.
--
-- Tausta:
--   Aiempi policy salli INSERT:n vain kuljettaja-roolille.
--   Nyt myös tyonjohto ja admin voivat kirjata tapahtumia,
--   kun he ovat valinneet Työ-näkymän.
--
--   Aktiivinen näkymä -tarkistus tehdään sovellustasolla
--   (lib/events.ts: tarkistaNakymaCookie), koska PostgreSQL RLS
--   ei voi suoraan lukea Next.js:n HTTP-evästeitä.
--
-- Muutettava policy:
--   Nykyinen:  rooli = 'kuljettaja'
--   Uusi:      rooli IN ('kuljettaja', 'tyonjohto', 'admin')
--
-- Käyttäjä-identiteettitarkistus säilyy: kayttaja_id täytyy
-- vastata kirjautuneen Auth-käyttäjän Viara-tunnistetta
-- (fn_oma_kayttaja() palauttama id).
--
-- Huom: "public" unrestricted INSERT -oikeutta ei anneta.

-- Poistetaan vanha policy
DROP POLICY IF EXISTS tapahtumat_insert_kuljettaja ON tapahtumat;

-- Luodaan uusi policy, joka kattaa kaikki työskentelyroolit
CREATE POLICY tapahtumat_insert_tyoroolit
  ON tapahtumat
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Kirjautuneen käyttäjän identiteettitarkistus
    kayttaja_id = (SELECT id FROM fn_oma_kayttaja())
    AND
    -- Työskentelyroolit: kuljettaja, tyonjohto, admin
    (SELECT rooli FROM fn_oma_kayttaja()) IN ('kuljettaja', 'tyonjohto', 'admin')
  );
