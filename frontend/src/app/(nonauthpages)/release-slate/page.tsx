import type { Project } from "@/types/ProjectTypes";
import ProjectsPage from "@/components/Projects";
import axios from "axios";

async function getProjects(): Promise<Project[]> {
    try {
      const response = await axios.get('http://127.0.0.1:4000/release-slate');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

export default async function ReleasePage() {
    const projects = await getProjects();
    return <ProjectsPage projects={projects}/>
}