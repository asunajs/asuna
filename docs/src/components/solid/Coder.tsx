import type { JSX } from 'solid-js';
type Component<P = { code: string }> = (props: P) => JSX.Element;

const Coder: Component = (props) => {
  return (
    <div class="expressive-code">
      <figure class="frame not-content">
        <figcaption class="header"></figcaption>
        <pre tabindex="0" dir="ltr">
          <code>
            <div class="ec-line">
              <div class="code">
                <span style="--0:#D6DEEB;--1:#403F53">{props.code}</span>
              </div>
            </div>
          </code>
        </pre>
        <div class="copy">
          <button
            title="Copy to clipboard"
            data-copied="Copied!"
            data-code={props.code}
          >
            <div></div>
          </button>
        </div>
      </figure>
    </div>
  );
};

export default Coder;
