import "./index.css";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import { useState } from "react";
import { piratify, unpiratify } from "./Kraken";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export type ButtonType = "encrypt" | "decrypt";

export type AnchorProps = {
  image: string;
  input?: string;
  buttonText: string;
  buttonType: ButtonType;
  InputPlaceholder: string;
  KeyInputPlaceholder: string;
  isSerious: boolean;
  aesMode: string;
  utfOrBase64: string;
};

export const Anchor = ({
  image,
  buttonText,
  buttonType,
  InputPlaceholder,
  KeyInputPlaceholder,
  isSerious,
  aesMode,
  utfOrBase64,
}: AnchorProps) => {
  const [outputVisible, setOutputVisible] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [outputIVText, setOutputIVText] = useState("");
  const [inputText, setInputText] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [ivInput, setIVInput] = useState("");

  const translateToOrFromPirate = async (
    inputText: string,
    key: string,
    aesMode: string,
    format: string,
    buttonType: ButtonType,
    iv: string
  ) => {
    if (outputVisible) {
      setOutputText("");
    } else {
      if (buttonType === "encrypt") {
        const response = await piratify(inputText, key, aesMode, format, iv);
        console.log(response);
        setOutputText(response.piratetext);
        console.log("hello", response.iv);
        setOutputIVText(response.iv);
      } else {
        setOutputText(await unpiratify(inputText, key, aesMode, format, iv));
      }
    }
    setOutputVisible(!outputVisible);
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const isValidLength = (
    text: string,
    type: "key" | "iv",
    format: string
  ): boolean => {
    if (format === "utf-8") {
      const validKeyLengths = [16, 24, 32];
      const validIVLengths = [16];
      return type === "key"
        ? validKeyLengths.includes(text.length)
        : validIVLengths.includes(text.length);
    } else if (format === "base64") {
      const validKeyLengths = [24, 32, 44];
      const validIVLengths = [16];
      return type === "key"
        ? validKeyLengths.includes(text.length)
        : validIVLengths.includes(text.length);
    }
    return false;
  };

  const buttonColor = isSerious ? "#f5f5f5" : "#4caf50";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <img
          src={image}
          alt="This was supposed to be a cool lego pirate or a serious pirate"
          className="w-64 h-auto object-cover"
        />

        <TextField
          id="filled-basic"
          label={InputPlaceholder}
          variant="filled"
          className="w-full mb-4"
          value={inputText}
          multiline
          onChange={(e) => setInputText(e.target.value)}
          sx={{
            backgroundColor: "#e0e0e0",
            "& .MuiFilledInput-root": {
              color: "#37474f",
            },
            "& .MuiInputLabel-root": {
              color: "#37474f",
            },
          }}
        />

        <TextField
          id="filled-basic"
          label={KeyInputPlaceholder}
          variant="filled"
          className="w-full mb-4"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          error={
            keyInput.length > 0 && !isValidLength(keyInput, "key", utfOrBase64)
          }
          helperText={
            keyInput.length > 0 && !isValidLength(keyInput, "key", utfOrBase64)
              ? utfOrBase64 === "utf-8"
                ? "Key must be 16, 24, or 32 characters long"
                : "Key must be 24, 32, or 44 characters long"
              : ""
          }
          sx={{
            backgroundColor: "#e0e0e0",
            "& .MuiFilledInput-root": {
              color: "#37474f",
            },
            "& .MuiInputLabel-root": {
              color: "#37474f",
            },
          }}
        />

        {aesMode === "cbc" && (
          <TextField
            id="filled-basic"
            label="Initialization Vector (IV)"
            variant="filled"
            className="w-full mb-4"
            value={ivInput}
            onChange={(e) => setIVInput(e.target.value)}
            error={
              ivInput.length > 0 && !isValidLength(ivInput, "iv", utfOrBase64)
            }
            helperText={
              ivInput.length > 0 && !isValidLength(ivInput, "iv", utfOrBase64)
                ? "IV must be 16 characters long"
                : ""
            }
            sx={{
              backgroundColor: "#e0e0e0",
              "& .MuiFilledInput-root": {
                color: "#37474f",
              },
              "& .MuiInputLabel-root": {
                color: "#37474f",
              },
            }}
          />
        )}

        <Button
          onClick={() =>
            translateToOrFromPirate(
              inputText,
              keyInput,
              aesMode,
              utfOrBase64,
              buttonType,
              ivInput
            )
          }
          className="mt-6 px-4 py-2 text-white transition duration-200"
          variant="outlined"
          disabled={!isValidLength(keyInput, "key", utfOrBase64)}
          startIcon={buttonType === "encrypt" ? <LockIcon /> : <LockOpenIcon />}
          sx={{
            backgroundColor: buttonColor,
            color: isSerious ? "#000" : "#fff",
            "&:hover": {
              backgroundColor: isSerious ? "#e0e0e0" : "#45a049",
            },
          }}
        >
          {buttonText}
        </Button>
        {outputVisible && (
          <>
            <TextField
              id="filled-basic"
              label="Output"
              value={outputText}
              variant="filled"
              className="w-full mb-4"
              multiline
              inputProps={{
                readOnly: true,
              }}
              sx={{
                backgroundColor: "#e0e0e0",
                "& .MuiFilledInput-root": {
                  color: "#37474f",
                },
                "& .MuiInputLabel-root": {
                  color: "#37474f",
                },
              }}
            />
            <div className="flex space-x-3">
              <Button
                onClick={() => copyToClipboard(outputText)}
                className="mt-2 px-4 py-2 text-white transition duration-200"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                sx={{
                  backgroundColor: buttonColor,
                  color: isSerious ? "#000" : "#fff",
                  "&:hover": {
                    backgroundColor: isSerious ? "#e0e0e0" : "#45a049",
                  },
                }}
              >
                Copy Output
              </Button>
              <Button
                onClick={() => copyToClipboard(keyInput)}
                startIcon={<ContentCopyIcon />}
                className="mt-2 px-4 py-2 text-white transition duration-200"
                variant="outlined"
                sx={{
                  backgroundColor: buttonColor,
                  color: isSerious ? "#000" : "#fff",
                  "&:hover": {
                    backgroundColor: isSerious ? "#e0e0e0" : "#45a049",
                  },
                }}
              >
                Copy Key
              </Button>
            </div>
            <TextField
              id="filled-basic"
              label="Output"
              value={outputIVText}
              variant="filled"
              className="w-full mb-4"
              multiline
              inputProps={{
                readOnly: true,
              }}
              sx={{
                backgroundColor: "#e0e0e0",
                "& .MuiFilledInput-root": {
                  color: "#37474f",
                },
                "& .MuiInputLabel-root": {
                  color: "#37474f",
                },
              }}
            />
            <Button
              onClick={() => copyToClipboard(outputIVText)}
              className="mt-2 px-4 py-2 text-white transition duration-200"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              sx={{
                backgroundColor: buttonColor,
                color: isSerious ? "#000" : "#fff",
                "&:hover": {
                  backgroundColor: isSerious ? "#e0e0e0" : "#45a049",
                },
              }}
            >
              Copy IV
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
