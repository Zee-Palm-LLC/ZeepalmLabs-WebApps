import { chapters, place } from "../data.js";

export default function StaticStory() {
  return (
    <section className="static-story" id="cook" aria-label="How a steak is cooked at Ember">
      <div className="static-hero">
        <img className="static-poster" src="./still-plated.jpg" alt="Sliced medium-rare ribeye on a dark plate, with salt falling onto it." />
        <div className="static-title">
          <h1 className="brand brand-static">Ember</h1>
          <p className="cook-hero-line">Everything we cook touches the fire.</p>
          <p className="cook-hero-place">{place.line}</p>
        </div>
      </div>
      <ol className="static-chapters">
        {chapters.map((chapter, index) => (
          <li key={chapter.key} className="static-chapter">
            <p className="chapter-count">{String(index + 1).padStart(2, "0")}</p>
            <h2>{chapter.title}</h2>
            <p>{chapter.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
