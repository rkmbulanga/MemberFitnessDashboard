import { render, fireEvent, screen } from '@testing-library/react-native';
import { ClassCard } from '../components/ClassCard';
import type { FitnessClass } from '../types/index';

function makeClass(overrides: Partial<FitnessClass> = {}): FitnessClass {
  return {
    id: 'c-1',
    gymId: 'gym-1',
    name: 'Sunrise Yoga',
    instructor: 'Maya Reed',
    type: 'yoga',
    startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    capacity: 10,
    bookedMemberIds: [],
    ...overrides,
  };
}

describe('ClassCard (React component)', () => {
  it('renders class name, instructor and capacity', () => {
    render(
      <ClassCard
        item={makeClass({ bookedMemberIds: ['x', 'y'] })}
        booked={false}
        pending={false}
        onBook={() => {}}
      />,
    );
    expect(screen.getByText('Sunrise Yoga')).toBeTruthy();
    expect(screen.getByText(/Maya Reed/)).toBeTruthy();
    expect(screen.getByText('2/10 spots')).toBeTruthy();
  });

  it('calls onBook with the class id when pressed', () => {
    const onBook = jest.fn();
    render(
      <ClassCard
        item={makeClass()}
        booked={false}
        pending={false}
        onBook={onBook}
      />,
    );
    fireEvent.press(screen.getByText('Book'));
    expect(onBook).toHaveBeenCalledWith('c-1');
  });

  it('disables the button and shows "Full" when at capacity', () => {
    const onBook = jest.fn();
    render(
      <ClassCard
        item={makeClass({ capacity: 2, bookedMemberIds: ['a', 'b'] })}
        booked={false}
        pending={false}
        onBook={onBook}
      />,
    );
    const button = screen.getByText('Full');
    fireEvent.press(button);
    expect(onBook).not.toHaveBeenCalled();
  });

  it('shows "Booked" when the member already booked', () => {
    render(
      <ClassCard
        item={makeClass({ bookedMemberIds: ['m-1'] })}
        booked={true}
        pending={false}
        onBook={() => {}}
      />,
    );
    expect(screen.getByText('Booked')).toBeTruthy();
  });
});
