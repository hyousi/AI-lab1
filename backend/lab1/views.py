from django.http import JsonResponse
import json
from z3 import *
from rest_framework import viewsets
from .serializers import PlayerSerializer
from .models import Player


class PlayerListCreate(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    queryset = Player.objects.all()


# TODO: filter GET request
# TODO: add cell ds


def chk_isbomb(row, col, board_data):
    height = len(board_data)
    width = len(board_data[0])

    s = Solver()
    cells = [[Int('cell_r=%d_c=%d' % (r, c)) for c in range(width + 2)] for r in range(height + 2)]

    # make boarder
    for c in range(width + 2):
        s.add(cells[0][c] == 0)
        s.add(cells[height + 1][c] == 0)
    for r in range(height + 2):
        s.add(cells[r][0] == 0)
        s.add(cells[r][width + 1] == 0)

    for r in range(1, height + 1):
        for c in range(1, width + 1):

            curr = board_data[r - 1][c - 1]
            if curr["isRevealed"]:
                s.add(cells[r][c] == 0)
                s.add(cells[r - 1][c - 1] + cells[r - 1][c] + cells[r - 1][c + 1]
                      + cells[r][c - 1] + cells[r][c + 1]
                      + cells[r + 1][c - 1] + cells[r + 1][c] + cells[r + 1][c + 1] == curr["neighbour"])

    s.add(cells[row + 1][col + 1] == 1)

    result = str(s.check())
    print(row, col, result, result == "sat")

    return result == "sat"


def infer(request):
    board_data = json.loads(request.body)

    height = len(board_data)
    width = len(board_data[0])

    for r in range(0, height):
        for c in range(0, width):
            if not board_data[r][c]["isRevealed"]:
                if not chk_isbomb(r, c, board_data):
                    board_data[r][c]["isRevealed"] = True

    return JsonResponse({
        'status': 'success',
        'board_data': board_data
    })
