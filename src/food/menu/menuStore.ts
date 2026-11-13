import { useEffect, useState } from 'react';
import type { MenuExtra, MenuState, PlannedDay, PlannedMeal } from './menuTypes';

export const MENU_STORAGE_KEY = 'fitfood:menu:v1';
export const MENU_REPLACED_EVENT = 'fitfood:menu-replaced';

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function readMeal(value: unknown): PlannedMeal | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    (item.meal !== 'breakfast' && item.meal !== 'lunch' && item.meal !== 'dinner')
    || typeof item.dishId !== 'string'
  ) return null;
  return {
    meal: item.meal,
    dishId: item.dishId,
    locked: item.locked === true,
    ...(item.overTarget === true ? { overTarget: true } : {})
  };
}

function readDay(value: unknown): PlannedDay | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (!isDateKey(item.dateKey) || !Array.isArray(item.meals)) return null;
  return {
    dateKey: item.dateKey,
    meals: item.meals.map(readMeal).filter((meal): meal is PlannedMeal => meal !== null),
    ...(item.overTarget === true ? { overTarget: true } : {}),
  };
}

function readExtra(value: unknown): MenuExtra | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.text !== 'string') return null;
  return { id: item.id, text: item.text, checked: item.checked === true };
}

export function emptyMenuState(): MenuState {
  return { version: 1, weekStart: '', days: [], checked: [], extras: [] };
}

export function addMenuExtra(state: MenuState, text: string, id: string): MenuState {
  const trimmed = text.trim();
  return trimmed ? { ...state, extras: [...state.extras, { id, text: trimmed, checked: false }] } : state;
}

export function removeMenuExtra(state: MenuState, id: string): MenuState {
  return { ...state, extras: state.extras.filter((extra) => extra.id !== id) };
}

export function parseMenuState(raw: string | null): MenuState {
  if (!raw) return emptyMenuState();
  try {
    return sanitizeMenuState(JSON.parse(raw));
  } catch {
    return emptyMenuState();
  }
}

export function sanitizeMenuState(raw: unknown): MenuState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyMenuState();
  const item = raw as Record<string, unknown>;
  if (item.version !== 1) return emptyMenuState();
  return {
    version: 1,
    weekStart: isDateKey(item.weekStart) ? item.weekStart : '',
    days: Array.isArray(item.days) ? item.days.map(readDay).filter((day): day is PlannedDay => day !== null) : [],
    checked: Array.isArray(item.checked) ? item.checked.filter((id): id is string => typeof id === 'string') : [],
    extras: Array.isArray(item.extras)
      ? item.extras.map(readExtra).filter((extra): extra is MenuExtra => extra !== null)
      : [],
  };
}

export function replaceMenuState(state: unknown): MenuState {
  const menu = sanitizeMenuState(state);
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MENU_REPLACED_EVENT));
  return menu;
}

function loadMenuState(): MenuState {
  try {
    return parseMenuState(localStorage.getItem(MENU_STORAGE_KEY));
  } catch {
    return emptyMenuState();
  }
}

export function useMenuStore() {
  const [menu, setMenu] = useState<MenuState>(loadMenuState);
  useEffect(() => {
    const reload = () => setMenu(loadMenuState());
    window.addEventListener(MENU_REPLACED_EVENT, reload);
    return () => window.removeEventListener(MENU_REPLACED_EVENT, reload);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
    } catch {
      // The menu remains available in memory when browser storage is blocked.
    }
  }, [menu]);
  return { menu, setMenu };
}
