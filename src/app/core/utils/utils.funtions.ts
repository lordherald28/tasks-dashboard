import { Task } from "../models/task";

/**
 * @description Funcion para devolver del listado de tareas aquellas que pertenecen al usuario logeado.
 * @param T 
 * @param id 
 * @returns 
 */
export const selectTaskById = <T extends { userId: number }>(
    tasks: T[],
    id: number
): T[] | undefined => {
    return tasks.filter(t => t.userId === id);
};