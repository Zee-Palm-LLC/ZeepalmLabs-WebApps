import { useEffect, useRef } from "react";
import { chapters } from "../story.js";
import StoryWidget from "../components/widgets.jsx";

export default function StaticStory() {
  const widgetRefs = useRef([]);

  useEffect(() => {
    widgetRefs.current.forEach((widget) => widget.update(1));
  }, []);

  return (
    <section className="static-story" id="story" aria-label="How Repline follows a lift">
      <div className="static-hero">
        <img
          className="static-poster"
          src="./poster.jpg"
          alt="A lifter pulling a loaded barbell from the floor, with the bar path traced in light."
        />
        <div className="static-title">
          <h1 className="brand">Repline</h1>
          <p className="tagline">One rep at a time.</p>
        </div>
      </div>
      <ol className="static-cards">
        {chapters.map((chapter, index) => (
          <li key={chapter.key} className="story-card story-card-static">
            <h2>{chapter.title}</h2>
            <p className="story-body">{chapter.body}</p>
            <StoryWidget
              kind={chapter.key}
              ref={(node) => {
                widgetRefs.current[index] = node;
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
