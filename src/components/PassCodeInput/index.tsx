import {
  type SyntheticEvent,
  createRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import styles from "./styles.module.scss";

interface BaseProps {
  numberOfInputs?: number;
  onValueChange?: (inputValue: string) => void;
  onValueEnter?: (inputValue: string) => void;
}

const PassCodeInput = ({
  numberOfInputs = 6,
  onValueChange,
  onValueEnter,
}: BaseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [letters, setLetters] = useState(() =>
    Array.from({ length: numberOfInputs }, () => "")
  );

  const [inputRefsArray] = useState(() =>
    Array.from({ length: numberOfInputs }, () => createRef<HTMLInputElement>())
  );

  const firstHalfOfInputs = inputRefsArray.slice(0, numberOfInputs / 2);
  const secondHalfOfInputs = inputRefsArray.slice(
    numberOfInputs / 2,
    numberOfInputs
  );

  function handleKeyPress(e: KeyboardEvent, index: number) {
    const { key, ctrlKey } = e;

    if (ctrlKey && key.toLowerCase() === "v") {
      return;
    }

    switch (key) {
      case "Backspace":
        if (!letters[index]) {
          setLetters((letters) => {
            return letters.map((letter, letterIndex) => {
              return letterIndex === index - 1 ? "" : letter;
            });
          });
          setCurrentIndex((currentSelectedIndex) => {
            const prevIndex =
              currentSelectedIndex <= numberOfInputs
                ? currentSelectedIndex - 1
                : null;

            if (prevIndex === 0 || prevIndex) {
              const prevInput = inputRefsArray?.[prevIndex]?.current;
              if (!prevInput) return currentSelectedIndex;

              prevInput.focus();
              inputRefsArray[prevIndex]?.current?.parentElement?.classList.add(
                styles.focused || ""
              );
              return prevIndex;
            }
            return prevIndex || currentSelectedIndex;
          });
          return;
        }
        if (letters[index]) {
          setLetters((letters) => {
            return letters.map((letter, letterIndex) => {
              return letterIndex === index ? "" : letter;
            });
          });
          return;
        }

        break;

      case "ArrowLeft":
        e.preventDefault();
        setCurrentIndex((currentSelectedIndex) => {
          const prevIndex =
            currentSelectedIndex <= numberOfInputs
              ? currentSelectedIndex - 1
              : null;

          if (prevIndex === 0 || prevIndex) {
            const prevInput = inputRefsArray?.[prevIndex]?.current;
            if (!prevInput) return currentSelectedIndex;
            inputRefsArray[prevIndex]?.current?.parentElement?.classList.add(
              styles.focused || ""
            );
            return prevIndex;
          }
          return prevIndex || currentSelectedIndex;
        });
        break;

      case "ArrowRight":
        e.preventDefault();
        setCurrentIndex((currentSelectedIndex) => {
          const prevIndex =
            currentSelectedIndex <= numberOfInputs
              ? currentSelectedIndex + 1
              : null;

          if (prevIndex === 0 || prevIndex) {
            const prevInput = inputRefsArray?.[prevIndex]?.current;
            if (!prevInput) return currentSelectedIndex;
            inputRefsArray[prevIndex]?.current?.parentElement?.classList.add(
              styles.focused || ""
            );
            return prevIndex;
          }
          return prevIndex || currentSelectedIndex;
        });
        break;
    }
  }

  function handleInputBlur(e: SyntheticEvent) {
    const target = e.target as HTMLDivElement;
    target.parentElement?.classList.remove(styles.focused || "");
  }

  function handleClipboardPaste(
    e: ClipboardEvent<HTMLInputElement>,
    index: number
  ) {
    const clipBoardData = e.clipboardData
      .getData("text/plain")
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/ +/, " ");

    const indexInputFocusedAfterPaste =
      index + clipBoardData.length >= numberOfInputs
        ? numberOfInputs - 1
        : index + clipBoardData.length;
    setLetters((prevLetters) => {
      let usedLetters = -1;
      const updatedLetters = prevLetters.map((letter, letterIndex) => {
        if (letterIndex >= index) {
          usedLetters++;
          return clipBoardData[usedLetters] || "";
        }
        return letter;
      });
      return updatedLetters;
    });
    setCurrentIndex(indexInputFocusedAfterPaste);
    inputRefsArray[indexInputFocusedAfterPaste]?.current?.focus();
    inputRefsArray[
      indexInputFocusedAfterPaste
    ]?.current?.parentElement?.classList.add(styles.focused || "");
  }
  function handleUserCodeInput(e: SyntheticEvent, index: number) {
    const { value } = e.target as HTMLInputElement;
    if (letters[index]) return;

    setLetters((letters) => {
      return letters.map((letter, letterIndex) => {
        if (letter) return letter;
        return letterIndex === index ? value.toUpperCase() : letter;
      });
    });

    setCurrentIndex((prevIndex) => {
      // calculate the next input index, next input after the final input will be again the first input. you can change the logic here as per your needs
      const nextIndex = prevIndex < numberOfInputs - 1 ? prevIndex + 1 : null;
      if (!nextIndex) return prevIndex;
      const nextInput = inputRefsArray?.[nextIndex]?.current;
      if (!nextInput) return prevIndex;
      nextInput.focus();
      inputRefsArray[nextIndex]?.current?.parentElement?.classList.add(
        styles.focused || ""
      );
      return nextIndex;
    });
  }

  useEffect(() => {
    inputRefsArray[currentIndex]?.current?.focus();
    onValueChange && onValueChange(letters.join().replace(/,/g, ""));
  }, [inputRefsArray, currentIndex, letters, onValueChange, onValueEnter]);

  useEffect(() => {
    const isLetterArrayFilled = letters.filter((letter) => letter !== "");

    if (isLetterArrayFilled.length === numberOfInputs)
      onValueEnter && onValueEnter(letters.join().replace(/,/g, ""));
  }, [letters]);

  useEffect(() => {
    inputRefsArray[0]?.current?.parentElement?.classList.add(
      styles.focused || ""
    );
  }, []);

  return (
    <form action="" className={styles["form"]}>
      <fieldset style={{ all: "unset" }}>
        <div className={styles["input__container"]}>
          <div className={styles["input__cell"]}>
            {firstHalfOfInputs.map((ref, index) => {
              return (
                <div
                  className={styles["input__item"]}
                  key={`box${index}-1`}
                  onBlur={handleInputBlur}
                >
                  <input
                    ref={ref}
                    type="text"
                    maxLength={1}
                    value={letters[index]}
                    onMouseDown={() => {
                      setCurrentIndex(index);
                      ref?.current?.parentElement?.classList.add(
                        styles.focused || ""
                      );
                    }}
                    aria-label={`dígito ${index + 1} de ${numberOfInputs}`}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    onChange={(e) => handleUserCodeInput(e, index)}
                    onFocus={(e) =>
                      e.currentTarget.setSelectionRange(
                        e.currentTarget.value.length,
                        e.currentTarget.value.length
                      )
                    }
                    onPaste={(e) => handleClipboardPaste(e, index)}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles["separator"]}>-</div>
          <div className={styles["input__cell"]}>
            {secondHalfOfInputs.map((ref, index) => {
              const secondHalfIndex = index + numberOfInputs / 2;
              return (
                <div
                  className={styles["input__item"]}
                  key={`box${index}-1`}
                  onBlur={handleInputBlur}
                >
                  <input
                    type="text"
                    ref={ref}
                    maxLength={1}
                    onKeyDown={(e) => handleKeyPress(e, secondHalfIndex)}
                    value={letters[secondHalfIndex]}
                    onMouseDown={() => {
                      setCurrentIndex(secondHalfIndex);
                      ref?.current?.parentElement?.classList.add(
                        styles.focused || ""
                      );
                    }}
                    onFocus={(e) =>
                      e.currentTarget.setSelectionRange(
                        e.currentTarget.value.length,
                        e.currentTarget.value.length
                      )
                    }
                    onChange={(e) => handleUserCodeInput(e, secondHalfIndex)}
                    onPaste={(e) => handleClipboardPaste(e, secondHalfIndex)}
                    aria-label={`dígito ${secondHalfIndex} de ${numberOfInputs}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export { PassCodeInput };
