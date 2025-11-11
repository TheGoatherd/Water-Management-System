from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Tank(BaseModel):
    id: Optional[int] = None
    x: float
    y: float

class Home(BaseModel):
    id: Optional[int] = None
    x: float
    y: float
    tankId: Optional[int] = None

class Bounds(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Sector(BaseModel):
    id: Optional[int] = None
    name: str
    bounds: Bounds
    tanks: List[Tank] = []
    homes: List[Home] = []

class Reservoir(BaseModel):
    x: float
    y: float
    capacity: int

class SystemData(BaseModel):
    reservoir: Reservoir
    sectors: List[Sector]

# In-memory storage - Fixed residential zones
data = {
    'reservoir': {'x': 865, 'y': 110, 'capacity': 10000},
    'sectors': [
        {
            'id': 1,
            'name': 'Residential Zone A',
            'bounds': {'x': 50, 'y': 80, 'width': 300, 'height': 200},
            'tanks': [],
            'homes': []
        },
        {
            'id': 2,
            'name': 'Residential Zone B',
            'bounds': {'x': 400, 'y': 80, 'width': 300, 'height': 200},
            'tanks': [],
            'homes': []
        },
        {
            'id': 3,
            'name': 'Residential Zone C',
            'bounds': {'x': 50, 'y': 320, 'width': 300, 'height': 200},
            'tanks': [],
            'homes': []
        },
        {
            'id': 4,
            'name': 'Residential Zone D',
            'bounds': {'x': 400, 'y': 320, 'width': 300, 'height': 200},
            'tanks': [],
            'homes': []
        },
        {
            'id': 5,
            'name': 'Residential Zone E',
            'bounds': {'x': 750, 'y': 320, 'width': 230, 'height': 200},
            'tanks': [],
            'homes': []
        }
    ]
}

@app.get('/api/data')
def get_data():
    return data

# Removed add_sector endpoint - zones are now fixed

@app.post('/api/sectors/{sector_id}/tanks')
def add_tank(sector_id: int, tank: Tank):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Residential zone not found')
    
    # Limit: Maximum 1 tank per residential zone
    if len(sector['tanks']) >= 1:
        raise HTTPException(status_code=400, detail='Maximum 1 tank allowed per residential zone')
    
    tank.id = 1
    tank_dict = tank.model_dump()
    sector['tanks'].append(tank_dict)
    return tank_dict

@app.post('/api/sectors/{sector_id}/homes')
def add_home(sector_id: int, home: Home):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Sector not found')
    
    # Limit: Maximum 5 homes per sector
    if len(sector['homes']) >= 5:
        raise HTTPException(status_code=400, detail='Maximum 5 homes allowed per sector')
    
    home.id = len(sector['homes']) + 1
    home_dict = home.model_dump()
    sector['homes'].append(home_dict)
    return home_dict

@app.delete('/api/sectors/{sector_id}/tanks/{tank_id}')
def delete_tank(sector_id: int, tank_id: int):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Sector not found')
    
    # Remove tank
    sector['tanks'] = [t for t in sector['tanks'] if t['id'] != tank_id]
    
    # Remove homes connected to this tank
    sector['homes'] = [h for h in sector['homes'] if h['tankId'] != tank_id]
    
    return {'message': 'Tank deleted successfully'}

@app.delete('/api/sectors/{sector_id}/homes/{home_id}')
def delete_home(sector_id: int, home_id: int):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Sector not found')
    
    # Remove home
    sector['homes'] = [h for h in sector['homes'] if h['id'] != home_id]
    
    return {'message': 'Home deleted successfully'}

# Removed delete_sector endpoint - zones are now fixed and cannot be deleted

@app.post('/api/reset')
def reset_system():
    """Reset the entire system - clear all tanks and homes from residential zones"""
    global data
    data = {
        'reservoir': {'x': 865, 'y': 110, 'capacity': 10000},
        'sectors': [
            {
                'id': 1,
                'name': 'Residential Zone A',
                'bounds': {'x': 50, 'y': 80, 'width': 300, 'height': 200},
                'tanks': [],
                'homes': []
            },
            {
                'id': 2,
                'name': 'Residential Zone B',
                'bounds': {'x': 400, 'y': 80, 'width': 300, 'height': 200},
                'tanks': [],
                'homes': []
            },
            {
                'id': 3,
                'name': 'Residential Zone C',
                'bounds': {'x': 50, 'y': 320, 'width': 300, 'height': 200},
                'tanks': [],
                'homes': []
            },
            {
                'id': 4,
                'name': 'Residential Zone D',
                'bounds': {'x': 400, 'y': 320, 'width': 300, 'height': 200},
                'tanks': [],
                'homes': []
            },
            {
                'id': 5,
                'name': 'Residential Zone E',
                'bounds': {'x': 750, 'y': 320, 'width': 230, 'height': 200},
                'tanks': [],
                'homes': []
            }
        ]
    }
    return {'message': 'System reset successfully', 'data': data}

class Position(BaseModel):
    x: float
    y: float

class Connection(BaseModel):
    tankId: int

@app.put('/api/sectors/{sector_id}/homes/{home_id}/connect')
def connect_home_to_tank(sector_id: int, home_id: int, connection: Connection):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Residential zone not found')
    
    home = next((h for h in sector['homes'] if h['id'] == home_id), None)
    if not home:
        raise HTTPException(status_code=404, detail='Home not found')
    
    # Verify tank exists in same sector
    tank = next((t for t in sector['tanks'] if t['id'] == connection.tankId), None)
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found in this zone')
    
    home['tankId'] = connection.tankId
    return home

@app.put('/api/sectors/{sector_id}/tanks/{tank_id}/position')
def update_tank_position(sector_id: int, tank_id: int, position: Position):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Sector not found')
    
    tank = next((t for t in sector['tanks'] if t['id'] == tank_id), None)
    if not tank:
        raise HTTPException(status_code=404, detail='Tank not found')
    
    tank['x'] = position.x
    tank['y'] = position.y
    return tank

@app.put('/api/sectors/{sector_id}/homes/{home_id}/position')
def update_home_position(sector_id: int, home_id: int, position: Position):
    sector = next((s for s in data['sectors'] if s['id'] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail='Sector not found')
    
    home = next((h for h in sector['homes'] if h['id'] == home_id), None)
    if not home:
        raise HTTPException(status_code=404, detail='Home not found')
    
    home['x'] = position.x
    home['y'] = position.y
    return home

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
