import type { JSX } from "react";
import type { Project } from "@/types/ProjectTypes";
import { notFound } from "next/navigation";
import moment from "moment";
import "@/styles/projectinfo-enhanced.css";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserLikedProject } from "@/db/project-likes";
import { getProjectInteractions, incrementProjectView } from "@/db/project-interactions";
import ProjectLikeButton from "@/components/project/ProjectLikeButton";
import ProjectShareButton from "@/components/project/ProjectShareButton";

interface IndividualProjectProps {
  project: Project;
}

const formatPosterPath = (path: string | undefined, phase: number): string => {
  if (!path) return "";
  const filename = path.split("/").pop();
  return `/images/Posters/Phase${phase}/${filename}`;
};

export default async function IndividualProject({
  project,
}: IndividualProjectProps): Promise<JSX.Element> {
  if (!project) {
    notFound();
  }
  
  const session = await auth.api.getSession({headers: await headers()});
  const userHasLiked = session?.user ? await getUserLikedProject(session.user.id, project.id) : null;
  const totalInteractions = await getProjectInteractions(project.id);
  
  // Increment view count
  await incrementProjectView(project.id);

  return (
    <div className="project-detail-page fade-in">
      <div className="project-detail-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{project.name}</h1>
          <p className="hero-description">
            Phase {project.phase} &bull; {moment(project.release_date).format("MMMM D, YYYY")}
          </p>
        </div>
      </div>
      
      <div className="project-detail-container">
        <div className="project-detail-content">
          <div className="poster-section">
            <div className="poster-container">
              <div className="phase-badge">Phase {project.phase}</div>
              <Image
                src={formatPosterPath(project.posterpath, project.phase)}
                alt={`${project.name} Poster`}
                className="project-detail-poster"
                width={300}
                height={450}
                priority
              />
            </div>
            
            {/* Add interaction buttons */}
            <div className="project-interactions">
              <ProjectLikeButton
                projectId={project.id}
                initialCount={totalInteractions.likes}
                userHasLiked={!!userHasLiked}
                isLoggedIn={!!session?.user}
              />
              <ProjectShareButton
                projectId={project.id}
                initialCount={totalInteractions.shares || 0}
              />
            </div>
          </div>
          
          <div className="project-info-section">
            <div className="info-block">
              <div className="section-title">
                <span className="title-text">Details</span>
                <div className="title-line"/>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <h3>Release Date</h3>
                  <p>{moment(project.release_date).format("dddd, D MMMM, YYYY")}</p>
                </div>
                
                <div className="info-item">
                  <h3>Director</h3>
                  <p>{project.director}</p>
                </div>
                
                <div className="info-item">
                  <h3>Music By</h3>
                  <p>{project.musicartist}</p>
                </div>
              </div>
            </div>
            
            <div className="info-block">
              <div className="section-title">
                <span className="title-text">Cast</span>
                <div className="title-line"/>
              </div>
              <p className="cast-info">{project.castinfo}</p>
            </div>
            
            <div className="info-block">
              <div className="section-title">
                <span className="title-text">Synopsis</span>
                <div className="title-line"/>
              </div>
              <p className="synopsis">{project.synopsis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}