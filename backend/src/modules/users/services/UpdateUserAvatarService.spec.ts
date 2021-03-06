import 'reflect-metadata';
import MockDiskStorageProvider from '@shared/container/providers/StorageProvider/mocks/MockStorageProvider';
import AppError from '@shared/error/AppError';
import MockUsersRepository from '../repositories/mocks/MockUsersRepository';
import UpdateUserAvatarService from './UpdateUserAvatarService';

let mockUsersRepository: MockUsersRepository;
let mockDiskStorageProvider: MockDiskStorageProvider;
let updateUserAvatar: UpdateUserAvatarService;

describe('UpdateUserAvatarService', () => {
  beforeEach(() => {
    mockUsersRepository = new MockUsersRepository();
    mockDiskStorageProvider = new MockDiskStorageProvider();

    updateUserAvatar = new UpdateUserAvatarService(
      mockUsersRepository,
      mockDiskStorageProvider,
    );
  });

  it('should be able to create a new user', async () => {
    const user = await mockUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFileName: 'avatar.jpg',
    });

    expect(user.avatar).toBe('avatar.jpg');
  });

  it('should not be able to update avatar from a non existing user', async () => {
    await expect(
      updateUserAvatar.execute({
        user_id: 'non-existing-user',
        avatarFileName: 'avatar.jpg',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should delete old avatar when updating new one', async () => {
    const deleteFile = jest.spyOn(mockDiskStorageProvider, 'deleteFile');

    const user = await mockUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFileName: 'avatar.jpg',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFileName: 'avatar2.jpg',
    });

    expect(deleteFile).toHaveBeenCalledWith('avatar.jpg');
    expect(user.avatar).toBe('avatar2.jpg');
  });
});
