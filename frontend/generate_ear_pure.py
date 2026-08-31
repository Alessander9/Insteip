import math

def catmull_rom(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2*p0 - 5*p1 + 4*p2 - p3) * t2 +
        (-p0 + 3*p1 - 3*p2 + p3) * t3
    )

def generate_ear_mesh(filename, nx=110, ny=150):
    # Puntos de control anatómicos reales de la oreja humana
    control_points = [
        (-0.58, -0.05), # 0. Trago
        (-0.50,  0.35), # 1. Incisura supratrágica
        (-0.55,  0.85), # 2. Hélix ascendente
        (-0.35,  1.45), # 3. Hélix anterosuperior
        ( 0.15,  1.82), # 4. Ápex de la oreja
        ( 0.65,  1.75), # 5. Borde superior post
        ( 0.95,  1.30), # 6. Tubérculo de Darwin
        ( 1.05,  0.50), # 7. Hélix posterior medio
        ( 0.90, -0.35), # 8. Hélix posterior inferior
        ( 0.65, -1.05), # 9. Unión hélix-lóbulo
        ( 0.28, -1.62), # 10. Fondo del lóbulo
        (-0.10, -1.68), # 11. Lóbulo inferior anterior
        (-0.38, -1.25), # 12. Lóbulo anterior
        (-0.45, -0.72), # 13. Escotadura intertrágica
        (-0.32, -0.45), # 14. Antitrago
        (-0.58, -0.05)  # 15. Cierre en el trago
    ]

    # Evaluar curva cerrada suave
    n_ctrl = len(control_points)
    poly = []
    n_eval_per_seg = 25
    for i in range(n_ctrl - 1):
        p0 = control_points[(i - 1) % (n_ctrl - 1)]
        p1 = control_points[i]
        p2 = control_points[i + 1]
        p3 = control_points[(i + 2) % (n_ctrl - 1)]
        for s in range(n_eval_per_seg):
            t = s / float(n_eval_per_seg)
            x = catmull_rom(p0[0], p1[0], p2[0], p3[0], t)
            y = catmull_rom(p0[1], p1[1], p2[1], p3[1], t)
            poly.append((x, y))

    def point_in_polygon(x, y, poly):
        inside = False
        n = len(poly)
        p1x, p1y = poly[0]
        for i in range(n + 1):
            p2x, p2y = poly[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside

    def dist_to_poly(x, y, poly):
        min_d = 9999.0
        n = len(poly)
        for i in range(n):
            p1x, p1y = poly[i]
            p2x, p2y = poly[(i + 1) % n]
            dx = p2x - p1x
            dy = p2y - p1y
            l2 = dx*dx + dy*dy
            if l2 == 0:
                d = math.hypot(x - p1x, y - p1y)
            else:
                t = max(0.0, min(1.0, ((x - p1x)*dx + (y - p1y)*dy) / l2))
                px = p1x + t * dx
                py = p1y + t * dy
                d = math.hypot(x - px, y - py)
            if d < min_d:
                min_d = d
        return min_d

    # Segmentos del Antehélix en 'Y'
    ah_stem = [(0.05, -0.40), (0.22, 0.15), (0.28, 0.65)]
    ah_sup  = [(0.28, 0.65), (0.16, 1.05), (-0.05, 1.40)]
    ah_inf  = [(0.28, 0.65), (0.08, 0.82), (-0.25, 0.78)]

    def dist_to_line_string(x, y, line):
        min_d = 9999.0
        for i in range(len(line) - 1):
            p1x, p1y = line[i]
            p2x, p2y = line[i + 1]
            dx = p2x - p1x
            dy = p2y - p1y
            l2 = dx*dx + dy*dy
            if l2 == 0:
                d = math.hypot(x - p1x, y - p1y)
            else:
                t = max(0.0, min(1.0, ((x - p1x)*dx + (y - p1y)*dy) / l2))
                px = p1x + t * dx
                py = p1y + t * dy
                d = math.hypot(x - px, y - py)
            if d < min_d:
                min_d = d
        return min_d

    min_x, max_x = -0.85, 1.25
    min_y, max_y = -1.85, 2.05

    grid_inside = [[False for _ in range(nx)] for _ in range(ny)]
    grid_z_front = [[0.0 for _ in range(nx)] for _ in range(ny)]
    grid_z_back = [[0.0 for _ in range(nx)] for _ in range(ny)]
    grid_x = [[0.0 for _ in range(nx)] for _ in range(ny)]
    grid_y = [[0.0 for _ in range(nx)] for _ in range(ny)]

    for iy in range(ny):
        y = min_y + (max_y - min_y) * (iy / (ny - 1))
        for ix in range(nx):
            x = min_x + (max_x - min_x) * (ix / (nx - 1))
            grid_x[iy][ix] = x
            grid_y[iy][ix] = y
            inside = point_in_polygon(x, y, poly)
            grid_inside[iy][ix] = inside

            if inside:
                d_edge = dist_to_poly(x, y, poly)
                
                # 1. Base anatómica suave
                z = 0.12 * math.sin(min(1.0, d_edge / 0.35) * math.pi * 0.5)

                # 2. HÉLIX EXTERIOR (Borde enrollado que bordea toda la oreja)
                if d_edge < 0.32:
                    helix_str = 0.34
                    if y < -0.8:
                        helix_str *= max(0.1, (y + 1.6) / 0.8)
                    z += helix_str * math.sin(d_edge / 0.32 * math.pi)

                # 3. ESCAFA (Gutter entre hélix y antehélix)
                if 0.22 <= d_edge <= 0.48 and y > -0.6 and x > 0.1:
                    scapha_factor = math.sin((d_edge - 0.22) / 0.26 * math.pi)
                    z -= 0.10 * scapha_factor

                # 4. ANTEHÉLIX EN 'Y' (Cresta de la Columna)
                d_ah = min(dist_to_line_string(x, y, ah_stem),
                           min(dist_to_line_string(x, y, ah_sup),
                               dist_to_line_string(x, y, ah_inf)))
                if d_ah < 0.22:
                    ah_height = 0.34 * math.exp(-(d_ah*d_ah) / (2.0 * (0.08*0.08)))
                    z += ah_height

                # 5. FOSA TRIANGULAR (Entre las ramas superior e inferior)
                d_ft = math.hypot(x - (-0.02), y - 1.08)
                if d_ft < 0.26 and y > 0.8:
                    z -= 0.12 * max(0.0, 1.0 - (d_ft / 0.26)**2)

                # 6. CONCHA CAVUM & CIMBA (Cuenco acústico central)
                d_concha = math.hypot(x - (-0.02), y - 0.08)
                if d_concha < 0.48:
                    concha_depth = 0.40 * max(0.0, 1.0 - (d_concha / 0.48)**2)
                    z -= concha_depth

                # 7. CONDUCTO AUDITIVO
                d_meatus = math.hypot(x - (-0.18), y - 0.0)
                if d_meatus < 0.16:
                    z -= 0.22 * max(0.0, 1.0 - (d_meatus / 0.16)**2)

                # 8. TRAGO (Saliente anterior protector)
                d_tragus = math.hypot(x - (-0.52), y - (-0.05))
                if d_tragus < 0.25:
                    z += 0.28 * max(0.0, 1.0 - (d_tragus / 0.25)**2)

                # 9. ANTITRAGO (Saliente sobre el lóbulo)
                d_antitragus = math.hypot(x - (-0.05), y - (-0.50))
                if d_antitragus < 0.22:
                    z += 0.24 * max(0.0, 1.0 - (d_antitragus / 0.22)**2)

                # 10. LÓBULO (Polo inferior carnoso suave)
                if y < -0.85:
                    d_lobe = math.hypot(x - 0.12, y - (-1.35))
                    z += 0.16 * max(0.0, 1.0 - (d_lobe / 0.65)**2)

                grid_z_front[iy][ix] = z
                grid_z_back[iy][ix] = -0.15 * math.sin(min(1.0, d_edge / 0.30) * math.pi * 0.5)

    verts = []
    vert_indices = {}
    idx = 1

    # Vértices frontales
    for iy in range(ny):
        for ix in range(nx):
            if grid_inside[iy][ix]:
                verts.append((grid_x[iy][ix], grid_y[iy][ix], grid_z_front[iy][ix]))
                vert_indices[(iy, ix, 'f')] = idx
                idx += 1

    # Vértices traseros
    for iy in range(ny):
        for ix in range(nx):
            if grid_inside[iy][ix]:
                verts.append((grid_x[iy][ix], grid_y[iy][ix], grid_z_back[iy][ix]))
                vert_indices[(iy, ix, 'b')] = idx
                idx += 1

    faces = []
    # Caras frontales
    for iy in range(ny - 1):
        for ix in range(nx - 1):
            if (grid_inside[iy][ix] and grid_inside[iy+1][ix] and
                grid_inside[iy+1][ix+1] and grid_inside[iy][ix+1]):
                i1 = vert_indices[(iy, ix, 'f')]
                i2 = vert_indices[(iy+1, ix, 'f')]
                i3 = vert_indices[(iy+1, ix+1, 'f')]
                i4 = vert_indices[(iy, ix+1, 'f')]
                faces.append((i1, i2, i3))
                faces.append((i1, i3, i4))

    # Caras traseras
    for iy in range(ny - 1):
        for ix in range(nx - 1):
            if (grid_inside[iy][ix] and grid_inside[iy+1][ix] and
                grid_inside[iy+1][ix+1] and grid_inside[iy][ix+1]):
                i1 = vert_indices[(iy, ix, 'b')]
                i2 = vert_indices[(iy+1, ix, 'b')]
                i3 = vert_indices[(iy+1, ix+1, 'b')]
                i4 = vert_indices[(iy, ix+1, 'b')]
                faces.append((i1, i3, i2))
                faces.append((i1, i4, i3))

    with open(filename, 'w') as f:
        f.write("# Anatomical Ear 3D Model\n")
        for v in verts:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            f.write(f"f {face[0]} {face[1]} {face[2]}\n")

    print(f"Modelo OBJ generado con exito: {filename} ({len(verts)} vertices, {len(faces)} caras)")

generate_ear_mesh("c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/frontend/src/assets/models/ear.obj")
