from fastapi.testclient import TestClient
from ..app.main import app

client = TestClient(app)

def test_list_mudras():
    response = client.get('/mudras')
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(item['name'] == 'Gyan Mudra' for item in data)


def test_recommend_stress():
    response = client.post('/recommend', json={'goal': 'stress'})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]['name'] in ['Gyan Mudra', 'Shuni Mudra']


def test_detect_mudra():
    response = client.post('/detect', json={'gesture_hint': 'I want better focus'})
    assert response.status_code == 200
    assert response.json()['mudra'] == 'Gyan Mudra'
