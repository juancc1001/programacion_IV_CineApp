export enum GrupoSanguineo {
    APositivo = 0,
    ANegativo = 1,
    BPositivo = 2,
    BNegativo = 3,
    ABPositivo = 4,
    ABNegativo = 5,
    OPositivo = 6,
    ONegativo = 7,
}

export const GrupoSanguineoLabel: Record<GrupoSanguineo, string> = {
    [GrupoSanguineo.APositivo]: 'A+',
    [GrupoSanguineo.ANegativo]: 'A-',
    [GrupoSanguineo.BPositivo]: 'B+',
    [GrupoSanguineo.BNegativo]: 'B-',
    [GrupoSanguineo.ABPositivo]: 'AB+',
    [GrupoSanguineo.ABNegativo]: 'AB-',
    [GrupoSanguineo.OPositivo]: '0+',
    [GrupoSanguineo.ONegativo]: '0-',
};
