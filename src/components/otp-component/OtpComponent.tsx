import { Input } from "antd";

interface PropsType {
  onChange: (value: string) => void;
  loading: boolean;
}

const OtpComponent = ({ onChange, loading }: PropsType) => {
  return (
    <>
      <Input.OTP
        formatter={(str) => str.toUpperCase()}
        disabled={loading}
        onChange={onChange}
      />
    </>
  );
};

export default OtpComponent;
