import type { Project } from '@/types/ProjectTypes';
import type { JSX } from 'react';
import { notFound } from 'next/navigation';
import axios from 'axios';
import IndividualProject from '@/components/IndividualProject';

async function getProjectData(id: string): Promise<Project | null> {
  try {
    const response = await axios.get<Project>(`http://127.0.0.1:4000/release-slate/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function ProjectPage({ 
  params 
}: { 
  params: { id: string } 
}): Promise<JSX.Element> {
  const project = await getProjectData(params.id);

  if (!project) {
    notFound();
  }

  return <IndividualProject project={project} />;
}