import profilePicture from "../../images/bio/about-marina.webp";

function About() {
  return (
    <div className="content-page-wrapper">
      <div
        className="left-column"
        style={{
          background: "url(" + profilePicture + ") no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="right-column">
        De petita era calba, després em van sortir quatre rínxols al clatell,
        ara els tenc llisos a l&rsquo;hivern i arrissats a l&rsquo;estiu, per
        l&rsquo;aigua de la mar. Vaig aprendre a nedar només amb el braç dret,
        amb l&rsquo;altre em tapava el nas per por que m&rsquo;entrés aigua,
        m&rsquo;hagués agradat néixer peix, peix volador, per&ograve; al manco
        els meus pares em van posar Marina.
      </div>
    </div>
  );
}

export default About;
