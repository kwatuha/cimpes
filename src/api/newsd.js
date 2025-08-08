import apiService from '../api'; // Adjust path based on your project structure

// Example usage:
async function fetchAllUsers() {
    try {
        const users = await apiService.users.getUsers();
        console.log(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}

async function createNewProject(projectData) {
    try {
        const newProject = await apiService.projects.createProject(projectData);
        console.log('Project created:', newProject);
    } catch (error) {
        console.error('Failed to create project:', error);
    }
}