function parseMarkdownToDOM(text) {
  // Create a container for all the content
  const fragment = document.createDocumentFragment();

  // Split by paragraphs (double newlines)
  const paragraphs = text.split("\n\n");

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) return;

    // Handle headings
    if (paragraph.match(/^#{1,3} /)) {
      const headingMatch = paragraph.match(/^(#{1,3}) (.*)$/);
      if (headingMatch) {
        const [, hashes, content] = headingMatch;
        const headingLevel = hashes.length;
        const heading = document.createElement(`h${headingLevel}`);
        heading.className = "ai-heading";
        parseInlineMarkdown(content, heading);
        fragment.appendChild(heading);
      }
      return;
    }

    // Handle lists
    if (paragraph.startsWith("- ")) {
      const listItems = paragraph
        .split("\n")
        .filter((line) => line.startsWith("- "));
      const ul = document.createElement("ul");
      listItems.forEach((item) => {
        const li = document.createElement("li");
        parseInlineMarkdown(item.substring(2), li); // Remove the "- "
        ul.appendChild(li);
      });
      fragment.appendChild(ul);
      return;
    }

    // Regular paragraphs
    const p = document.createElement("p");
    parseInlineMarkdown(paragraph, p);
    fragment.appendChild(p);
  });

  return fragment;
}

function parseInlineMarkdown(text, parentElement) {
  let currentIndex = 0;
  let textContent = "";

  for (let i = 0; i < text.length; i++) {
    // Check for bold **text**
    if (text.substring(i, i + 2) === "**") {
      // Add previous text content
      if (textContent) {
        parentElement.appendChild(document.createTextNode(textContent));
        textContent = "";
      }

      // Find closing **
      const endBold = text.indexOf("**", i + 2);
      if (endBold !== -1) {
        const boldText = text.substring(i + 2, endBold);
        const strong = document.createElement("strong");
        strong.appendChild(document.createTextNode(boldText));
        parentElement.appendChild(strong);
        i = endBold + 1; // Skip past the closing **
        currentIndex = i + 1;
      }
    }
    // Check for italic *text*
    else if (text[i] === "*" && (i === 0 || text[i - 1] !== "*")) {
      // Add previous text content
      if (textContent) {
        parentElement.appendChild(document.createTextNode(textContent));
        textContent = "";
      }

      // Find closing *
      const endItalic = text.indexOf("*", i + 1);
      if (endItalic !== -1 && text[endItalic + 1] !== "*") {
        const italicText = text.substring(i + 1, endItalic);
        const em = document.createElement("em");
        em.appendChild(document.createTextNode(italicText));
        parentElement.appendChild(em);
        i = endItalic;
        currentIndex = i + 1;
      }
    } else {
      textContent += text[i];
    }
  }

  // Add any remaining text
  if (textContent) {
    parentElement.appendChild(document.createTextNode(textContent));
  }
}

export { parseMarkdownToDOM };
