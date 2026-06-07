from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models import Card, UserWallet, User
from schemas import CardOut, WalletAddRequest, UserWalletCardOut, WalletCardUpdateRequest
from routers.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["cards"])

@router.get("/cards", response_model=List[CardOut])
async def get_all_cards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Card))
    return result.scalars().all()

@router.get("/wallet", response_model=List[UserWalletCardOut])
async def get_wallet(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Card, UserWallet).join(UserWallet, Card.id == UserWallet.card_id).where(UserWallet.user_id == current_user.id)
    )
    pairs = result.all()
    
    # If no cards in wallet, auto-seed/auto-provision all cards for this user
    if not pairs:
        cards_result = await db.execute(select(Card))
        all_cards = cards_result.scalars().all()
        
        for card in all_cards:
            wallet_entry = UserWallet(
                user_id=current_user.id,
                card_id=card.id,
                nickname=card.name,
                card_category="Platinum",
                card_network=card.network,
                card_limit=100000.0,
                available_balance=100000.0
            )
            db.add(wallet_entry)
        await db.commit()
        
        # Re-fetch populated wallet
        result = await db.execute(
            select(Card, UserWallet).join(UserWallet, Card.id == UserWallet.card_id).where(UserWallet.user_id == current_user.id)
        )
        pairs = result.all()

    out = []
    for card, wallet in pairs:
        out.append(UserWalletCardOut(
            id=card.id,
            name=card.name,
            issuer=card.issuer,
            network=wallet.card_network or card.network,
            annual_fee=card.annual_fee,
            rules=card.rules,
            offers=card.offers,
            nickname=wallet.nickname,
            card_category=wallet.card_category,
            card_network=wallet.card_network,
            card_limit=wallet.card_limit,
            available_balance=wallet.available_balance
        ))
    return out

@router.put("/wallet/{card_id}")
async def update_wallet_card(card_id: str,
                             body: WalletCardUpdateRequest,
                             current_user: User = Depends(get_current_user),
                             db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserWallet).where(
            UserWallet.user_id == current_user.id,
            UserWallet.card_id == card_id
        )
    )
    wallet = result.scalars().first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Card not in wallet")
        
    if body.nickname is not None:
        wallet.nickname = body.nickname
    if body.card_category is not None:
        wallet.card_category = body.card_category
    if body.card_network is not None:
        wallet.card_network = body.card_network
    if body.card_limit is not None:
        wallet.card_limit = body.card_limit
    if body.available_balance is not None:
        wallet.available_balance = body.available_balance
        
    await db.commit()
    return {"status": "updated"}

@router.post("/wallet", status_code=201)
async def add_to_wallet(body: WalletAddRequest,
                        current_user: User = Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    # Check card exists
    card = await db.get(Card, body.card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    # Check already in wallet
    existing = await db.execute(
        select(UserWallet).where(
            UserWallet.user_id == current_user.id,
            UserWallet.card_id == body.card_id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Card already in wallet")
    wallet = UserWallet(user_id=current_user.id, card_id=body.card_id)
    db.add(wallet)
    await db.commit()
    return {"status": "added"}

@router.delete("/wallet/{card_id}")
async def remove_from_wallet(card_id: str,
                             current_user: User = Depends(get_current_user),
                             db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserWallet).where(
            UserWallet.user_id == current_user.id,
            UserWallet.card_id == card_id
        )
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Card not in wallet")
    await db.delete(entry)
    await db.commit()
    return {"status": "removed"}
