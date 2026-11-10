import { Input } from "@mui/joy";

interface PropsType {
  onChange: (value: string) => void;
  loading: boolean;
}

const OtpComponent = ({ onChange, loading }: PropsType) => {
  return (
    <Input
      sx={{
        letterSpacing: "0.5rem",
        textAlign: "center",
        fontSize: "1.25rem",
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 600,
        color: "#1B2A5C",
        borderRadius: "10px",
        borderColor: "#E4E1DA",
        backgroundColor: "#FFFFFF",
        minHeight: "48px",
        "--Input-paddingInline": "1rem",
        "--Input-focusedHighlight": "#1B2A5C",
      }}
      slotProps={{
        input: {
          maxLength: 6,
          style: { textAlign: "center", letterSpacing: "0.5rem" },
        },
      }}
      disabled={loading}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder="------"
    />
  );
};

export default OtpComponent;
