import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
const AppCard = ({
  title,
  body,
  icon,
  isLoading,
}: {
  title: string | undefined;
  body: string | undefined;
  icon: JSX.Element;
  isLoading: boolean;
}) => {
  return (
    <>
      {!isLoading && (
        <Card
          variant="plain"
          // color="primary"
          // invertedColors
          size="sm"
          sx={{
            boxShadow: "sm",
            Width: 300,
            // maxWidth: '100%',
            background: "linear-gradient(to top, #1C1C1C1F, #FFFFFF0C)",
            // to make the demo resizeable
            overflow: "auto",
            // resize: 'horizontal',
          }}
        >
          <div className="h-12 w-12">{icon}</div>
          <CardContent>
            <Typography level="title-md">{title}</Typography>
            <Typography level="body-sm">{body}</Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AppCard;
