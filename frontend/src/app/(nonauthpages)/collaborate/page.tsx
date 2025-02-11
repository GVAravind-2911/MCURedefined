import type {JSX} from 'react';

export default function CollaboratePage(): JSX.Element {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '63vh',
  };

  const headingStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color:"white"
  };

  return (
    <div className="fade-in" style={containerStyle}>
      <h1 style={headingStyle}>Coming Soon</h1>
    </div>
  );
}