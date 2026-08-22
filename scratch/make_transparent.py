import zlib
import struct
import math

def process_png(input_path, output_path):
    with open(input_path, 'rb') as f:
        data = f.read()

    if data[:8] != b'\x89PNG\r\n\x1a\n':
        print("Not a valid PNG file")
        return

    pos = 8
    width = height = 0
    bit_depth = color_type = 0
    idat_chunks = []

    while pos < len(data):
        length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
        chunk_data = data[pos+8:pos+8+length]
        crc = data[pos+8+length:pos+12+length]
        pos += 12 + length

        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack('>IIBBBBB', chunk_data)
            print(f"IHDR: {width}x{height}, bit_depth={bit_depth}, color_type={color_type}")
        elif chunk_type == b'IDAT':
            idat_chunks.append(chunk_data)

    decompressed = zlib.decompress(b''.join(idat_chunks))
    
    # We need to handle scanlines
    # If RGB (color_type 2) or RGBA (color_type 6)
    bytes_per_pixel = 4 if color_type == 6 else 3 if color_type == 2 else 0
    if bytes_per_pixel == 0:
        print("Unsupported color type:", color_type)
        return

    stride = width * bytes_per_pixel + 1
    new_raw = bytearray()
    
    # Defilter
    prev_line = bytearray(width * bytes_per_pixel)
    curr_line_unfiltered = bytearray(width * bytes_per_pixel)
    
    output_rgba = bytearray(width * height * 4)

    def paeth_predictor(a, b, c):
        p = a + b - c
        pa = abs(p - a)
        pb = abs(p - b)
        pc = abs(p - c)
        if pa <= pb and pa <= pc:
            return a
        elif pb <= pc:
            return b
        else:
            return c

    for y in range(height):
        filter_type = decompressed[y * stride]
        scanline = decompressed[y * stride + 1 : (y + 1) * stride]
        
        line_unfiltered = bytearray(len(scanline))
        for x in range(len(scanline)):
            filt = filter_type
            x_val = scanline[x]
            bpp = bytes_per_pixel
            a = line_unfiltered[x - bpp] if x >= bpp else 0
            b = prev_line[x]
            c = prev_line[x - bpp] if x >= bpp else 0
            
            if filt == 0:
                recon = x_val
            elif filt == 1:
                recon = (x_val + a) & 0xff
            elif filt == 2:
                recon = (x_val + b) & 0xff
            elif filt == 3:
                recon = (x_val + (a + b) // 2) & 0xff
            elif filt == 4:
                recon = (x_val + paeth_predictor(a, b, c)) & 0xff
            else:
                recon = x_val
            line_unfiltered[x] = recon

        prev_line = line_unfiltered

        # Convert line to RGBA with background transparency
        for x in range(width):
            idx = x * bytes_per_pixel
            if color_type == 6: # RGBA
                r, g, b, a_val = line_unfiltered[idx], line_unfiltered[idx+1], line_unfiltered[idx+2], line_unfiltered[idx+3]
            else: # RGB
                r, g, b = line_unfiltered[idx], line_unfiltered[idx+1], line_unfiltered[idx+2]
                a_val = 255
            
            # Check for white/near-white background
            # Background in screenshot is ~#f4f4f4 - #ffffff
            if r > 235 and g > 235 and b > 235:
                # Calculate alpha drop off for smooth anti-aliased edge
                min_c = min(r, g, b)
                alpha = max(0, int(255 * (1.0 - (min_c - 235) / 20.0)))
                a_val = min(a_val, alpha)

            out_idx = (y * width + x) * 4
            output_rgba[out_idx] = r
            output_rgba[out_idx+1] = g
            output_rgba[out_idx+2] = b
            output_rgba[out_idx+3] = a_val

    # Encode new PNG (RGBA)
    raw_idat = bytearray()
    for y in range(height):
        raw_idat.append(0) # Filter type 0
        raw_idat.extend(output_rgba[y * width * 4 : (y + 1) * width * 4])

    compressed_idat = zlib.compress(raw_idat, 9)

    def make_chunk(chunk_type, data):
        length = struct.pack('>I', len(data))
        content = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(content) & 0xffffffff)
        return length + content + crc

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = make_chunk(b'IHDR', ihdr_data)
    idat_chunk = make_chunk(b'IDAT', compressed_idat)
    iend_chunk = make_chunk(b'IEND', b'')

    with open(output_path, 'wb') as f:
        f.write(png_header + ihdr_chunk + idat_chunk + iend_chunk)

    print(f"Processed PNG saved to {output_path}")

process_png(
    '/Volumes/AKSHAYA/Hyna project file -August/Hyna-Workspace/assets/Screenshot 2026-08-22 at 6.43.40 PM.png',
    '/Volumes/AKSHAYA/Hyna project file -August/Hyna-Workspace/assets/logo.png'
)
