import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const meta: Meta<typeof Accordion> = {
  title: 'Styles/Accordion',
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Basic: Story = {
  render: () => (
    <Stack>
      {[1, 2, 3].map((i) => (
        <Accordion key={i}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Accordion {i}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Stack>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Enabled</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Content</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion disabled>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Disabled</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Content</Typography>
        </AccordionDetails>
      </Accordion>
    </Stack>
  ),
};

export const DefaultExpanded: Story = {
  render: () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Default Expanded</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>This accordion starts expanded.</Typography>
      </AccordionDetails>
    </Accordion>
  ),
};
