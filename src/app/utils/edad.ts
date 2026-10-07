export function cumpleEdad(birthdate: string, edad: number): boolean {
  const [anio, mes, dia] = birthdate.split('-').map(Number);
  const cumpleEdadMinima = new Date(anio + edad, mes - 1, dia);
  // compara la fecha de edad minima con la fecha actual
  return cumpleEdadMinima <= new Date();
}
