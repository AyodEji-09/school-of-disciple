import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type ItemType = {
    id: string
    title: string,
    text: string
}

export default function ControlledAccordions({items}: {items: ItemType[]}) {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div>
        {items.map(item => (
      <Accordion expanded={expanded === item.id} onChange={handleChange(item.id)} sx={{boxShadow: 'none', background: 'white'}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography component="p" variant='subtitle1' color='#999' fontWeight={500}>
          {item.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color='#555' fontSize={18}>
            {item.text}
          </Typography>
        </AccordionDetails>
      </Accordion>
        ))}
    </div>
  );
}
