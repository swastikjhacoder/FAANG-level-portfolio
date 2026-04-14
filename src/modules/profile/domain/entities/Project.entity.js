export class Project {
  constructor({
    profileId,
    name,
    liveUrl,
    githubUrl,
    techStack = [],
    description = [],
    screenshot,
  }) {
    this.profileId = profileId;
    this.name = name;
    this.liveUrl = liveUrl;
    this.githubUrl = githubUrl;
    this.techStack = techStack;
    this.description = description;
    this.screenshot = screenshot;
  }

  validate() {
    if (!this.name) throw new Error("Project name required");
  }
}
