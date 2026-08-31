import numpy as np
import math

def generate_anatomical_ear_obj(filename, nx=100, ny=140):
    # Definir la curva perimetral de la oreja humana real (Spline cerrado)
    control_points = np.array([
        [-0.60, -0.05], # Trago
        [-0.52,  0.35], # Incisura supratrágica
        [-0.58,  0.85], # Hélix ascendente
        [-0.35,  1.45], # Hélix anterosuperior
        [ 0.15,  1.82], # Ápex de la oreja
        [ 0.65,  1.75], # Borde superior post
        [ 0.95,  1.30], # Tubérculo de Darwin
        [ 1.05,  0.50], # Hélix posterior medio
        [ 0.90, -0.35], # Hélix posterior inferior
        [ 0.65, -1.05], # Unión hélix-lóbulo
        [ 0.28, -1.62], # Fondo del lóbulo
        [-0.10, -1.68], # Lóbulo inferior anterior
        [-0.38, -1.25], # Lóbulo anterior
        [-0.45, -0.72], # Escotadura intertrágica
        [-0.32, -0.45], # Antitrago
        [-0.60, -0.05]  # Cierre en el trago
    ])

    # Interpolación periódica suave
    t_ctrl = np.linspace(0, 1, len(control_points))
    t_eval = np.linspace(0, 1, 300)
    
    # Crear spline perimetral usando interpolación cúbica periódica
    from scipy.interpolate import CubicSpline
    cs_x = CubicSpline(t_ctrl, control_points[:, 0], bc_type='periodic')
    cs_y = CubicSpline(t_ctrl, control_points[:, 1], bc_type='periodic')
    
    poly_x = cs_x(t_eval)
    poly_y = cs_y(t_eval)
    
    # Rejilla 2D regular
    gx = np.linspace(-0.85, 1.25, nx)
    gy = np.linspace(-1.85, 2.05, ny)
    GX, GY = np.meshgrid(gx, gy)
    
    # Calcular distancia al contorno (Signed Distance Field aproximado)
    from matplotlib.path import Path
    ear_path = Path(np.column_stack([poly_x, poly_y]))
    mask_inside = ear_path.contains_points(np.column_stack([GX.ravel(), GY.ravel()])).reshape(GX.shape)
    
    # Esculpir la superficie Z(x, y)
    Z_front = np.zeros_like(GX)
    Z_back = np.zeros_like(GX)
    
    # Líneas centrales del Antehélix
    # Tronco
    ah_stem = np.array([[0.05, -0.40], [0.25, 0.15], [0.30, 0.65]])
    # Rama superior
    ah_sup  = np.array([[0.30, 0.65], [0.18, 1.05], [-0.05, 1.40]])
    # Rama inferior
    ah_inf  = np.array([[0.30, 0.65], [0.10, 0.82], [-0.25, 0.78]])

    def dist_to_segment_poly(px, py, poly):
        min_d = np.full_like(px, 999.0)
        for i in range(len(poly) - 1):
            p1 = poly[i]
            p2 = poly[i+1]
            seg_v = p2 - p1
            seg_len2 = np.dot(seg_v, seg_v)
            if seg_len2 == 0:
                d = np.hypot(px - p1[0], py - p1[1])
            else:
                t = np.clip(((px - p1[0])*seg_v[0] + (py - p1[1])*seg_v[1]) / seg_len2, 0.0, 1.0)
                proj_x = p1[0] + t * seg_v[0]
                proj_y = p1[1] + t * seg_v[1]
                d = np.hypot(px - proj_x, py - proj_y)
            min_d = np.minimum(min_d, d)
        return min_d

    d_stem = dist_to_segment_poly(GX, GY, ah_stem)
    d_sup  = dist_to_segment_poly(GX, GY, ah_sup)
    d_inf  = dist_to_segment_poly(GX, GY, ah_inf)
    d_antihelix = np.minimum(d_stem, np.minimum(d_sup, d_inf))

    # Calcular distancia al borde perimetral para cada punto dentro
    boundary_pts = np.column_stack([poly_x, poly_y])
    
    for iy in range(ny):
        for ix in range(nx):
            if not mask_inside[iy, ix]:
                continue
            
            x = GX[iy, ix]
            y = GY[iy, ix]
            
            # Distancia al borde exterior
            d_edge = np.min(np.hypot(poly_x - x, poly_y - y))
            
            # 1. Base anatómica convexa
            z = 0.12 * math.sin(min(1.0, d_edge / 0.35) * math.pi * 0.5)
            
            # 2. HÉLIX EXTERIOR (Borde enrollado que bordea la oreja)
            if d_edge < 0.32:
                # El hélix es prominente arriba y atrás, pero suave en el lóbulo
                helix_str = 0.32
                if y < -0.8:
                    helix_str *= max(0.1, (y + 1.6) / 0.8)
                z += helix_str * math.sin(d_edge / 0.32 * math.pi)
            
            # 3. ESCAFA (Gutter entre hélix y antehélix)
            if d_edge >= 0.22 and d_edge <= 0.48 and y > -0.6 and x > 0.1:
                scapha_factor = math.sin((d_edge - 0.22) / 0.26 * math.pi)
                z -= 0.10 * scapha_factor
            
            # 4. ANTEHÉLIX EN 'Y' (Cresta de la Columna)
            dah = d_antihelix[iy, ix]
            if dah < 0.22:
                ah_height = 0.32 * math.exp(-(dah**2) / (2 * (0.08**2)))
                z += ah_height
            
            # 5. FOSA TRIANGULAR (Entre las ramas superior e inferior)
            d_ft = math.hypot(x - (-0.02), y - 1.08)
            if d_ft < 0.26 and y > 0.8:
                z -= 0.12 * max(0.0, 1.0 - (d_ft / 0.26)**2)
            
            # 6. CONCHA CAVUM & CIMBA (Cuenco acústico central)
            d_concha = math.hypot(x - (-0.02), y - 0.08)
            if d_concha < 0.48:
                concha_depth = 0.38 * max(0.0, 1.0 - (d_concha / 0.48)**2)
                z -= concha_depth
            
            # 7. CONDUCTO AUDITIVO (Punto más profundo)
            d_meatus = math.hypot(x - (-0.18), y - 0.0)
            if d_meatus < 0.16:
                z -= 0.20 * max(0.0, 1.0 - (d_meatus / 0.16)**2)
            
            # 8. TRAGO (Saliente anterior protector)
            d_tragus = math.hypot(x - (-0.52), y - (-0.05))
            if d_tragus < 0.25:
                z += 0.28 * max(0.0, 1.0 - (d_tragus / 0.25)**2)
            
            # 9. ANTITRAGO (Saliente sobre el lóbulo)
            d_antitragus = math.hypot(x - (-0.05), y - (-0.50))
            if d_antitragus < 0.22:
                z += 0.24 * max(0.0, 1.0 - (d_antitragus / 0.22)**2)
            
            # 10. LÓBULO (Polo inferior carnoso)
            if y < -0.85:
                d_lobe = math.hypot(x - 0.12, y - (-1.35))
                z += 0.16 * max(0.0, 1.0 - (d_lobe / 0.65)**2)
            
            Z_front[iy, ix] = z
            Z_back[iy, ix] = -0.12 * math.sin(min(1.0, d_edge / 0.30) * math.pi * 0.5)

    # Exportar archivo OBJ 3D con vértices y caras continuas
    verts = []
    vert_indices = {}
    
    # Crear vértices frontales
    idx = 1
    for iy in range(ny):
        for ix in range(nx):
            if mask_inside[iy, ix]:
                verts.append((GX[iy, ix], GY[iy, ix], Z_front[iy, ix]))
                vert_indices[(iy, ix, 'f')] = idx
                idx += 1
                
    # Crear vértices traseros
    for iy in range(ny):
        for ix in range(nx):
            if mask_inside[iy, ix]:
                verts.append((GX[iy, ix], GY[iy, ix], Z_back[iy, ix]))
                vert_indices[(iy, ix, 'b')] = idx
                idx += 1

    faces = []
    
    # Caras frontales
    for iy in range(ny - 1):
        for ix in range(nx - 1):
            if mask_inside[iy, ix] and mask_inside[iy+1, ix] and mask_inside[iy+1, ix+1] and mask_inside[iy, ix+1]:
                i1 = vert_indices[(iy, ix, 'f')]
                i2 = vert_indices[(iy+1, ix, 'f')]
                i3 = vert_indices[(iy+1, ix+1, 'f')]
                i4 = vert_indices[(iy, ix+1, 'f')]
                faces.append((i1, i2, i3))
                faces.append((i1, i3, i4))
                
    # Caras traseras (orden invertido para normales hacia afuera)
    for iy in range(ny - 1):
        for ix in range(nx - 1):
            if mask_inside[iy, ix] and mask_inside[iy+1, ix] and mask_inside[iy+1, ix+1] and mask_inside[iy, ix+1]:
                i1 = vert_indices[(iy, ix, 'b')]
                i2 = vert_indices[(iy+1, ix, 'b')]
                i3 = vert_indices[(iy+1, ix+1, 'b')]
                i4 = vert_indices[(iy, ix+1, 'b')]
                faces.append((i1, i3, i2))
                faces.append((i1, i4, i3))

    with open(filename, 'w') as f:
        f.write("# Anatomical Human Ear 3D Model\n")
        f.write(f"# Vertices: {len(verts)}, Faces: {len(faces)}\n")
        for v in verts:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            f.write(f"f {face[0]} {face[1]} {face[2]}\n")

    print(f"Modelo generado exitosamente: {filename} ({len(verts)} vertices, {len(faces)} caras)")

generate_anatomical_ear_obj("c:/Users/Alessander/Desktop/TRABAJOS/ACTUALES/Insteip/frontend/src/assets/models/ear.obj")
