import { Avatar, Stack, Typography } from "@mui/joy";

const AvatarText = ({ text }: { text: string }) => {
  return (
    <Stack direction={"row"} alignItems={"center"} gap={1}>
      {text && (
        <Avatar variant="soft" color="neutral" size="sm">
          {text[0]}
        </Avatar>
      )}
      <Typography level="body-sm" textColor={"#001F54"}>
        {text}
      </Typography>
    </Stack>
  );
};

export default AvatarText;
