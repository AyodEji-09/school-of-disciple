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
        "--Input-paddingInline": "1rem" 
      }}
      slotProps={{
        input: {
          maxLength: 6,
          style: { textAlign: "center", letterSpacing: "0.5rem" }
        }
      }}
      disabled={loading}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder="------"
    />
  );
};

export default OtpComponent;
