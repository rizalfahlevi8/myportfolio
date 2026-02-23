"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { extractUsernameFromUrl } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Building,
  Code,
  ExternalLink,
  FilePen,
  Github,
  Loader2,
  MapPin,
  Tag,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import { EditAboutDialog } from "./components/about-edit-dialog";
import { useAbout } from "@/hooks/admin/use-about"; // Import custom hook
import { useAboutStore } from "@/store/admin/about-store"; // Import store untuk dialog
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  // Gunakan Custom Hook
  const {
    aboutData,
    isLoading,
    isError,
    error,
    handleUpdateAbout,
    updateMutation,
  } = useAbout();

  // Akses state dari store
  const { updatingId } = useAboutStore();

  function formatDate(date: Date | null) {
    if (!date) return "Sekarang";
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
  }

  const user = aboutData;

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Heading title="About Management" description="Kelola data diri kamu" />
        <div className="flex items-center gap-4">
          {user && (
            <EditAboutDialog
              about={user}
              onUpdate={handleUpdateAbout}
              isUpdating={updatingId === user.id || updateMutation.isPending}
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading Data...</p>
        </div>
      ) : isError ? (
        <p className="text-red-500">{error?.message}</p>
      ) : user ? (
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPen className="h-5 w-5" />
                Data Diri Kamu
              </CardTitle>
              <CardDescription>
                Data ini akan tampil di landing page
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Image */}
                <div className="shrink-0 mx-auto lg:mx-0">
                  {user.profilePicture ? (
                    <div className="relative w-40 h-40 lg:w-48 lg:h-48 overflow-hidden rounded-xl border-2 border-border/50 shadow-md">
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 lg:w-48 lg:h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-border/50">
                      <Code className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-lg text-primary">{user.jobTitle}</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {user.introduction}
                    </p>
                  </div>

                  {/* Skills Section */}
                  {user.Skills && user.Skills.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Tag className="h-4 w-4" />
                        Teknologi & Skills
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {user.Skills.map((skill: any) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/80 border border-border rounded-lg text-sm font-medium"
                          >
                            {skill.icon && (
                              <i className={`${skill.icon} text-lg`}></i>
                            )}
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Media Section */}
                  {user.sosmed && user.sosmed.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Tag className="h-4 w-4" />
                        Social Media
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {user.sosmed.map((sosmed: any) => {
                          const username = extractUsernameFromUrl(sosmed.url);
                          return (
                            <a
                              key={sosmed.id}
                              href={sosmed.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-secondary/80 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors group"
                            >
                              {sosmed.name ? (
                                <i
                                  className={`fa-brands fa-${sosmed.name} text-lg group-hover:scale-110 transition-transform`}
                                />
                              ) : (
                                <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
                                  <Code className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span>{username || "UnURL"}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          {user.projects && user.projects.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FilePen className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Proyek</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {user.projects.map((project: any) => (
                  <Card
                    key={project.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                                {project.category}
                              </Badge>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {project.tagline}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-xs"
                          >
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Source Code
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button size="sm" asChild className="text-xs">
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience Section */}
          {user.workExperiences && user.workExperiences.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Pengalaman Kerja</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {user.workExperiences.map((exp: any) => (
                  <Card
                    key={exp.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{exp.position}</CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Building className="h-4 w-4" />
                            <span className="font-medium text-primary">
                              {exp.company}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {exp.employmenttype}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{exp.location}</span>
                            <span>•</span>
                            <span>{exp.locationtype}</span>
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg inline-block">
                        {formatDate(new Date(exp.startDate))} -{" "}
                        {formatDate(exp.endDate ? new Date(exp.endDate) : null)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Code className="h-10 w-10 mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Data tidak ditemukan</p>
        </div>
      )}
    </div>
  );
}
