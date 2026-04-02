import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Typography,
  Stack,
} from '@mui/material';

const meta: Meta<typeof Stepper> = {
  title: 'Styles/Stepper',
  component: Stepper,
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const steps = [
  'Select campaign settings',
  'Create an ad group',
  'Create an ad',
];

export const Horizontal: Story = {
  render: () => (
    <Stepper activeStep={1}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={4}>
      {[0, 1, 2, 3].map((activeStep) => (
        <Box key={activeStep}>
          <Typography variant="caption" gutterBottom>
            Active step: {activeStep}
          </Typography>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      ))}
    </Stack>
  ),
};

export const AlternativeLabel: Story = {
  render: () => (
    <Stepper activeStep={1} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  ),
};

const VerticalDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
          <StepContent>
            <Typography>Content for step {index + 1}.</Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => setActiveStep(index + 1)}
              >
                {index === steps.length - 1 ? 'Finish' : 'Continue'}
              </Button>
              <Button
                size="small"
                disabled={index === 0}
                onClick={() => setActiveStep(index - 1)}
                sx={{ ml: 1 }}
              >
                Back
              </Button>
            </Box>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
};

export const Vertical: Story = {
  render: () => <VerticalDemo />,
};
